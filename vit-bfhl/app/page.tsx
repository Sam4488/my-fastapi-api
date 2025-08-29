import BFHLForm from "@/components/bfhl-form"

export default function HomePage() {
  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-balance">VIT BFHL Tester</h1>
        <p className="text-sm text-muted-foreground">
          Enter your hosted API endpoint and payload to verify the expected response.
        </p>
      </header>
      <BFHLForm />
      <footer className="text-xs text-muted-foreground">
        Backend contract: POST /bfhl with body {"{ data: [...] }"} returns 200 on success.
      </footer>
    </main>
  )
}
