import { useState } from "react";

import { ForgotPasswordForm } from "../components/forgot_password_form";
import { ForgotPasswordSent } from "../components/forgot_password_sent";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSent = (value: string): void => {
    setEmail(value);
    setIsSent(true);
  };

  const handleResend = (): void => {
    setIsSent(false);
  };

  if (isSent) return <ForgotPasswordSent onResend={handleResend} />;

  return (
    <ForgotPasswordForm
      defaultEmail={email}
      autoFocus={email.length > 0}
      onSent={handleSent}
    />
  );
};

export default ForgotPasswordPage;
