import './Auth.css'

export default function FirebaseSetupPage({ message }: { message: string }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Firebase setup needed</h1>
        <p className="auth-subtitle">{message}</p>
        <p className="auth-subtitle">
          Add your web app config to <code>.env</code>, then restart the dev server (
          <code>npm run dev</code>).
        </p>
        <p className="auth-subtitle">
          Get values from Firebase Console → Project Settings → Your apps → Web, or run{' '}
          <code>firebase apps:sdkconfig WEB</code>.
        </p>
      </div>
    </div>
  )
}
