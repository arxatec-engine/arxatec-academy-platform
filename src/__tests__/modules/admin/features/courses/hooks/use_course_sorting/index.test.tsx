import type { DragEndEvent } from "@dnd-kit/react";
import { Sortable } from "@dnd-kit/dom/sortable";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCourseSorting } from "@/modules/admin/features/courses/hooks/use_course_sorting";
import { ADMIN_KEYS } from "@/modules/admin/keys";
import type { AdminCourseList } from "@/modules/admin/types";
import {
  axiosInstanceMock,
  resetInterceptorsMock,
} from "../../../../../../mocks/interceptors";
import {
  createTestQueryClient,
  createWrapper,
} from "../../../../../../utils/render_with_providers";

vi.mock("@/interceptors", async () => {
  const module = await import("../../../../../../mocks/interceptors");
  return module.interceptorsModuleMock;
});
vi.mock("sonner", () => ({
  toast: {
    promise: vi.fn((promise: Promise<unknown>) => {
      void promise.catch(() => {});
    }),
  },
}));

const initialData: AdminCourseList = {
  courses: ["Fundamentos", "Automatización", "IA aplicada", "Archivado"].map(
    (title, index) => ({
      id: `course-${index + 1}`,
      title,
      slug: `curso-${index + 1}`,
      topic: "FIRST_STEPS",
      level: "INTRODUCTORY",
      status: index === 3 ? "ARCHIVED" : "DRAFT",
      lesson_count: 0,
      published_lesson_count: 0,
      catalog_order: index + 1,
      updated_at: "2026-10-17T12:00:00.000Z",
    }),
  ),
  counts: { total: 4, published: 0, draft: 3, archived: 1 },
};
const sortables: Sortable[] = [];
const dragEvent = (
  from: number,
  to: number,
  { canceled = false, outside = false } = {},
): DragEndEvent => {
  const sortable = new Sortable(
    { id: `course-${from + 1}`, index: to },
    undefined,
  );
  vi.spyOn(sortable, "initialIndex", "get").mockReturnValue(from);
  sortables.push(sortable);
  return {
    canceled,
    operation: {
      source: sortable.draggable,
      target: outside ? null : sortable.droppable,
    },
  } as DragEndEvent;
};
const renderSorting = () => {
  const client = createTestQueryClient();
  client.setQueryData(ADMIN_KEYS.courses(), structuredClone(initialData));
  const rendered = renderHook(() => useCourseSorting(), {
    wrapper: createWrapper({ queryClient: client }),
  });
  return { ...rendered, client };
};

describe("orden vertical de los cursos", () => {
  beforeEach(() => {
    resetInterceptorsMock();
    axiosInstanceMock.put.mockImplementation(
      async (_url: string, { course_ids }: { course_ids: string[] }) => ({
        data: {
          data: {
            ...initialData,
            courses: [
              ...course_ids.map((id, index) => ({
                ...initialData.courses.find((course) => course.id === id)!,
                catalog_order: index + 1,
              })),
              initialData.courses[3]!,
            ],
          },
        },
      }),
    );
  });
  afterEach(() => {
    sortables.splice(0).forEach((sortable) => sortable.destroy());
  });

  it.each([
    [0, 2, ["course-2", "course-3", "course-1"]],
    [2, 0, ["course-3", "course-1", "course-2"]],
  ] as const)(
    "guarda al soltar de %i a %i y excluye los cursos archivados",
    async (from, to, expected) => {
      const { result, client } = renderSorting();
      act(() => result.current.startDrag());
      act(() => result.current.endDrag(dragEvent(from, to)));
      await waitFor(() => expect(axiosInstanceMock.put).toHaveBeenCalledOnce());
      await waitFor(() => expect(result.current.isSaving).toBe(false));
      expect(axiosInstanceMock.put).toHaveBeenCalledWith(
        "/admin/courses/order",
        { course_ids: expected },
      );
      expect(result.current.courses.map((course) => course.id)).toEqual([
        ...expected,
        "course-4",
      ]);
      expect(
        client
          .getQueryData<AdminCourseList>(ADMIN_KEYS.courses())
          ?.courses.map((course) => course.id),
      ).toEqual([...expected, "course-4"]);
    },
  );

  it.each([
    { from: 0, to: 2, canceled: true, outside: false },
    { from: 0, to: 0, canceled: false, outside: false },
    { from: 0, to: 2, canceled: false, outside: true },
    { from: 0, to: 3, canceled: false, outside: false },
  ])(
    "no guarda un arrastre cancelado, sin cambio o sin destino válido: %j",
    ({ from, to, ...options }) => {
      const { result } = renderSorting();
      act(() => result.current.startDrag());
      act(() => result.current.endDrag(dragEvent(from, to, options)));
      expect(axiosInstanceMock.put).not.toHaveBeenCalled();
      expect(result.current.courses.map((course) => course.id)).toEqual(
        initialData.courses.map((course) => course.id),
      );
    },
  );

  it("muestra el nuevo orden mientras guarda y restaura el anterior si falla", async () => {
    let rejectSave!: (reason: Error) => void;
    axiosInstanceMock.put.mockReturnValue(
      new Promise((_resolve, reject) => {
        rejectSave = reject;
      }),
    );
    const { result, client } = renderSorting();
    act(() => result.current.startDrag());
    act(() => result.current.endDrag(dragEvent(0, 2)));
    await waitFor(() => expect(result.current.isSaving).toBe(true));
    expect(result.current.courses.map((course) => course.id)).toEqual([
      "course-2",
      "course-3",
      "course-1",
      "course-4",
    ]);
    act(() => result.current.move(0, 1));
    expect(axiosInstanceMock.put).toHaveBeenCalledOnce();
    await act(async () => rejectSave(new Error("Offline")));
    await waitFor(() => expect(result.current.isSaving).toBe(false));
    expect(result.current.courses.map((course) => course.id)).toEqual(
      initialData.courses.map((course) => course.id),
    );
    expect(client.getQueryData(ADMIN_KEYS.courses())).toEqual(initialData);
  });

  it("mantiene estable la lista durante un arrastre aunque se actualice la consulta", async () => {
    const { result, client } = renderSorting();
    act(() => result.current.startDrag());
    const refreshed: AdminCourseList = {
      ...initialData,
      courses: [...initialData.courses].reverse(),
    };
    act(() => client.setQueryData(ADMIN_KEYS.courses(), refreshed));
    await waitFor(() => expect(result.current.query.data).toEqual(refreshed));
    expect(result.current.courses.map((course) => course.id)).toEqual(
      initialData.courses.map((course) => course.id),
    );
    act(() => result.current.endDrag(dragEvent(0, 1, { canceled: true })));
    expect(result.current.courses.map((course) => course.id)).toEqual([
      "course-3",
      "course-2",
      "course-1",
      "course-4",
    ]);
    expect(axiosInstanceMock.put).not.toHaveBeenCalled();
  });

  it("mantiene los controles Subir y Bajar y evita mover fuera de los límites", async () => {
    const { result } = renderSorting();
    act(() => result.current.move(0, -1));
    act(() => result.current.move(2, 3));
    act(() => result.current.move(3, 0));
    expect(axiosInstanceMock.put).not.toHaveBeenCalled();
    act(() => result.current.move(1, 0));
    await waitFor(() =>
      expect(axiosInstanceMock.put).toHaveBeenCalledWith(
        "/admin/courses/order",
        { course_ids: ["course-2", "course-1", "course-3"] },
      ),
    );
  });
});
