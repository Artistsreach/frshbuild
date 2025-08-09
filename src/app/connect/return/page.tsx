export default function ConnectReturnPage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-semibold">Details submitted</h1>
        <p className="text-muted-foreground">
          That's everything we need for now. If Stripe still needs more info later,
          come back and click <strong>Get Funded</strong> again to continue.
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
        >
          Back to home
        </a>
      </div>
    </main>
  );
}
