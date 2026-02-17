import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">כניסה לאזור האישי</h1>
        <LoginForm />
      </div>
    </div>
  );
}
