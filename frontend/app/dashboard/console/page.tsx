"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

type Tab = "ingest" | "cardinality" | "frequency" | "stats";

export default function ConsolePage() {
  const [tab, setTab] = useState<Tab>("ingest");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // ingest tab
  const [ingestStream, setIngestStream] = useState("pageviews");
  const [ingestEvents, setIngestEvents] = useState(
    '[{"user_id":"u-001","page":"/home"},{"user_id":"u-002","page":"/pricing"}]'
  );

  // cardinality tab
  const [cardStream, setCardStream] = useState("pageviews");
  const [cardField, setCardField] = useState("user_id");

  // frequency tab
  const [freqStream, setFreqStream] = useState("pageviews");
  const [freqField, setFreqField] = useState("page");
  const [freqTopK, setFreqTopK] = useState("10");
  const [quantileStream, setQuantileStream] = useState("response_times");
  const [quantileField, setQuantileField] = useState("latency_ms");
  const [quantileQ, setQuantileQ] = useState("0.99");

  async function post(path: string, body: unknown) {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setResult(`Error: ${e}`);
    } finally {
      setLoading(false);
    }
  }

  async function get(path: string) {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch(`${API_BASE}${path}`);
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setResult(`Error: ${e}`);
    } finally {
      setLoading(false);
    }
  }

  const tabs: Tab[] = ["ingest", "cardinality", "frequency", "stats"];

  return (
    <div className="min-h-screen bg-gray-900 text-green-400 font-mono p-6">
      <h1 className="text-2xl font-bold mb-6 text-green-300">
        ALICE-Analytics-SaaS / Console
      </h1>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setResult(""); }}
            className={`px-4 py-2 rounded text-sm uppercase tracking-wide transition-colors ${
              tab === t
                ? "bg-green-700 text-white"
                : "bg-gray-800 text-green-400 hover:bg-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6 space-y-4">
        {/* INGEST */}
        {tab === "ingest" && (
          <>
            <h2 className="text-lg font-semibold text-green-300">Ingest Events</h2>
            <label className="block text-sm">
              Stream Name
              <input
                className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-green-400 focus:outline-none focus:border-green-500"
                value={ingestStream}
                onChange={(e) => setIngestStream(e.target.value)}
              />
            </label>
            <label className="block text-sm">
              Events (JSON array)
              <textarea
                rows={5}
                className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-green-400 focus:outline-none focus:border-green-500 resize-none"
                value={ingestEvents}
                onChange={(e) => setIngestEvents(e.target.value)}
              />
            </label>
            <button
              onClick={() => {
                let events: unknown;
                try { events = JSON.parse(ingestEvents); } catch { events = []; }
                post("/api/v1/analytics/ingest", {
                  stream: ingestStream,
                  events,
                });
              }}
              disabled={loading}
              className="px-5 py-2 bg-green-700 hover:bg-green-600 rounded text-white text-sm disabled:opacity-50"
            >
              {loading ? "Ingesting..." : "POST /analytics/ingest"}
            </button>
          </>
        )}

        {/* CARDINALITY */}
        {tab === "cardinality" && (
          <>
            <h2 className="text-lg font-semibold text-green-300">Cardinality Estimation (HyperLogLog)</h2>
            <label className="block text-sm">
              Stream Name
              <input
                className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-green-400 focus:outline-none focus:border-green-500"
                value={cardStream}
                onChange={(e) => setCardStream(e.target.value)}
              />
            </label>
            <label className="block text-sm">
              Field
              <input
                className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-green-400 focus:outline-none focus:border-green-500"
                value={cardField}
                onChange={(e) => setCardField(e.target.value)}
              />
            </label>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  post("/api/v1/analytics/cardinality", {
                    stream: cardStream,
                    field: cardField,
                  })
                }
                disabled={loading}
                className="px-5 py-2 bg-green-700 hover:bg-green-600 rounded text-white text-sm disabled:opacity-50"
              >
                {loading ? "Estimating..." : "POST /analytics/cardinality"}
              </button>
              <button
                onClick={() => get("/api/v1/analytics/sketches")}
                disabled={loading}
                className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded text-green-400 text-sm disabled:opacity-50"
              >
                GET /analytics/sketches
              </button>
            </div>
          </>
        )}

        {/* FREQUENCY */}
        {tab === "frequency" && (
          <>
            <h2 className="text-lg font-semibold text-green-300">Frequency & Quantile Analysis</h2>
            <div className="border border-gray-700 rounded p-4 space-y-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Top-K Frequency (Count-Min Sketch)</p>
              <div className="grid grid-cols-3 gap-3">
                <label className="block text-sm col-span-1">
                  Stream
                  <input
                    className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-green-400 focus:outline-none focus:border-green-500"
                    value={freqStream}
                    onChange={(e) => setFreqStream(e.target.value)}
                  />
                </label>
                <label className="block text-sm col-span-1">
                  Field
                  <input
                    className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-green-400 focus:outline-none focus:border-green-500"
                    value={freqField}
                    onChange={(e) => setFreqField(e.target.value)}
                  />
                </label>
                <label className="block text-sm col-span-1">
                  Top K
                  <input
                    className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-green-400 focus:outline-none focus:border-green-500"
                    type="number"
                    min={1}
                    value={freqTopK}
                    onChange={(e) => setFreqTopK(e.target.value)}
                  />
                </label>
              </div>
              <button
                onClick={() =>
                  post("/api/v1/analytics/frequency", {
                    stream: freqStream,
                    field: freqField,
                    top_k: parseInt(freqTopK),
                  })
                }
                disabled={loading}
                className="px-5 py-2 bg-green-700 hover:bg-green-600 rounded text-white text-sm disabled:opacity-50"
              >
                {loading ? "Analyzing..." : "POST /analytics/frequency"}
              </button>
            </div>
            <div className="border border-gray-700 rounded p-4 space-y-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Quantile Estimation (DDSketch)</p>
              <div className="grid grid-cols-3 gap-3">
                <label className="block text-sm col-span-1">
                  Stream
                  <input
                    className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-green-400 focus:outline-none focus:border-green-500"
                    value={quantileStream}
                    onChange={(e) => setQuantileStream(e.target.value)}
                  />
                </label>
                <label className="block text-sm col-span-1">
                  Field
                  <input
                    className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-green-400 focus:outline-none focus:border-green-500"
                    value={quantileField}
                    onChange={(e) => setQuantileField(e.target.value)}
                  />
                </label>
                <label className="block text-sm col-span-1">
                  Quantile (0.0 - 1.0)
                  <input
                    className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-green-400 focus:outline-none focus:border-green-500"
                    type="number"
                    step="0.01"
                    min={0}
                    max={1}
                    value={quantileQ}
                    onChange={(e) => setQuantileQ(e.target.value)}
                  />
                </label>
              </div>
              <button
                onClick={() =>
                  post("/api/v1/analytics/quantile", {
                    stream: quantileStream,
                    field: quantileField,
                    q: parseFloat(quantileQ),
                  })
                }
                disabled={loading}
                className="px-5 py-2 bg-blue-700 hover:bg-blue-600 rounded text-white text-sm disabled:opacity-50"
              >
                {loading ? "Estimating..." : "POST /analytics/quantile"}
              </button>
            </div>
          </>
        )}

        {/* STATS */}
        {tab === "stats" && (
          <>
            <h2 className="text-lg font-semibold text-green-300">Analytics Stats</h2>
            <p className="text-sm text-gray-400">
              Fetch overall analytics stats: ingested events, active sketches, and stream list.
            </p>
            <button
              onClick={() => get("/api/v1/analytics/stats")}
              disabled={loading}
              className="px-5 py-2 bg-green-700 hover:bg-green-600 rounded text-white text-sm disabled:opacity-50"
            >
              {loading ? "Loading..." : "GET /analytics/stats"}
            </button>
          </>
        )}
      </div>

      {/* Result */}
      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Response</p>
        <pre className="text-green-400 text-sm whitespace-pre-wrap break-all min-h-[120px]">
          {loading ? "Waiting for response..." : result || "— no result yet —"}
        </pre>
      </div>
    </div>
  );
}
