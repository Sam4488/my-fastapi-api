"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ApiResponse = {
  is_success: boolean
  user_id: string
  email: string
  roll_number: string
  odd_numbers: string[]
  even_numbers: string[]
  alphabets: string[]
  special_characters: string[]
  sum: string
  concat_string: string
}

export default function BFHLForm() {
  const [apiUrl, setApiUrl] = useState("")
  const [dataText, setDataText] = useState(`["a","1","334","4","R","$"]`)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ApiResponse | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)

    if (!apiUrl.trim()) {
      setError("Enter your hosted API URL (e.g., https://your-app.onrender.com/bfhl).")
      return
    }

    let parsed: unknown
    try {
      const maybe = JSON.parse(dataText)
      parsed = Array.isArray(maybe) ? { data: maybe } : maybe
    } catch {
      setError('Invalid JSON. Provide an array or an object like { "data": [...] }.')
      return
    }

    const body =
      parsed && typeof parsed === "object" && "data" in (parsed as Record<string, unknown>)
        ? (parsed as Record<string, unknown>)
        : { data: parsed }

    if (!Array.isArray((body as any).data)) {
      setError("Request must be an array or { data: [...] }.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(apiUrl.trim(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json?.detail || "Request failed")
      } else {
        setResult(json as ApiResponse)
      }
    } catch (err: any) {
      setError(err?.message || "Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border">
      <CardHeader>
        <CardTitle className="text-lg text-pretty">Test /bfhl</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="apiUrl" className="text-sm font-medium">
              Hosted API URL (POST /bfhl)
            </label>
            <Input
              id="apiUrl"
              placeholder="https://your-app.onrender.com/bfhl"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="data" className="text-sm font-medium">
              Input JSON
            </label>
            <Textarea id="data" rows={6} value={dataText} onChange={(e) => setDataText(e.target.value)} />
            <p className="text-xs text-muted-foreground">
              Paste an array like ["a","1","334","4","R","$"] or an object like {'{ "data": [ ... ] }'}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
            {error && <span className="text-sm text-red-600">{error}</span>}
          </div>
        </form>

        {result && (
          <pre className="mt-4 overflow-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(result, null, 2)}</pre>
        )}
      </CardContent>
    </Card>
  )
}
