# Hackathon Demo & Video Submission Script (3–4 Minutes)
## Platform: ReconOps — Autonomous Finance Cloud

**Target Track:** Fintech Operations, Autonomous Reconciliation & Cash Intelligence  
**Core Value Thesis:** *"Deterministic first. AI second. Human last."*  
**Recommended Video Recording Time:** 3 minutes 30 seconds  

---

## 🎬 Act 1: The Executive Overview & Problem Context (0:00 – 0:45)
**Screen:** `http://localhost:3000/` (Executive Overview)

* **Visual Focus:**
  * Zoom in on the high-level KPI cards: **Total Volume Processed** (₹21.21L), **Auto-Match Rate** (99.42%), and **Unallocated Exposure** (₹69,207.53).
* **Voiceover / Pitch:**
  > *"Modern finance teams at fast-scaling merchants process thousands of payments and multi-batch settlements across payment gateways and bank statements. Traditional rule engines either break with opaque discrepancies or drown finance controllers in manual spreadsheets.*
  > 
  > *Meet **ReconOps (Autonomous Finance Cloud)**: an enterprise-grade fintech operations engine that reconciles gateway settlements, bank statements, and ledgers in sub-milliseconds with mathematical precision, continuous anomaly detection, and automated period-close governance."*
* **Interactive Action:**
  * Click **`Model Performance`** in the header. Show the **5,000-record benchmark**, **0.06% False Match Rate**, and **7/7 passing adversarial tests** (Duplicate UTR, Holiday Lag, Refund Deductions). Show the **-71.4% False Match Reduction** over naive matching engines. Close modal.

---

## 🎬 Act 2: Deterministic Reconciliation & Audit Gates in Action (0:45 – 1:30)
**Screen:** `http://localhost:3000/reconciliation` (Reconciliation Ledger)

* **Visual Focus:**
  * Show the compact reconciliation table matching **Payment Gateway Inflows ⟷ Settlement Batches ⟷ Bank Statement Credits**.
* **Voiceover / Pitch:**
  > *"Unlike black-box AI chatbots, our core matching engine is 100% deterministic. We enforce a strict safety rule: Score must be 95% or higher, candidate margin must be at least 5%, and there must be zero debit/credit reversals. Otherwise, the system refuses to guess."*
* **Interactive Action:**
  * Click **`Logic`** on any matched record to open **Why This Match Decision?**.
  * Point out the **6 verified deterministic gates**:
    1. Exact UTR Index Match
    2. Net Settlement Amount Equality (₹0.00 difference)
    3. T+2 Value-Date Calendar Lag Window
    4. Duplicate Posting Prevention
    5. Reversal Contradiction Gate
    6. 5.0% Candidate Safety Margin Gate
  * Click **`Trace`** to reveal the **Audit Trail** linking $\text{Customer} \to \text{Payment} \to \text{Settlement} \to \text{Bank} \to \text{Ledger}$ with unified Lineage ID `LIN-XXXXXX`.

---

## 🎬 Act 3: Live Anomaly Injection via Scenario Sandbox (1:30 – 2:15)
**Screen:** `http://localhost:3000/` (Overview — Live Webhook Event Stream)

* **Visual Focus:**
  * Right sidebar container: **Webhook Event Stream** with live status indicator.
* **Voiceover / Pitch:**
  > *"Let's test the system in real time. We've built an adversarial Scenario Sandbox connected directly to our cryptographic webhook pipeline."*
* **Interactive Action:**
  * Click **`⚡ Simulate Settlement Delay (+₹26.4K)`**.
  * Watch the live event ticker fire: `settlement.processed` (+₹26,400.00).
  * Point out the real-time balance sheet reaction:
    * **Unallocated Exposure** jumps $+₹26,400.00$.
    * **Period Close Readiness** drops from $96.7\% \to 94.2\%$.
    * The **Exception Queue** immediately promotes `EX-XXXX: Missing Settlement` to the #1 priority position based on cash impact.

---

## 🎬 Act 4: Forensic SQL Triage, Math Proof & What-If Simulation (2:15 – 3:00)
**Screen:** `http://localhost:3000/` (Exception Queue)

* **Visual Focus:**
  * Row #1 in the Exception Queue.
* **Voiceover / Pitch:**
  > *"For every exception, the controller has full forensic evidence."*
* **Interactive Action:**
  1. Click **`Trace`** (Payload Trace) on the new exception $\to$ Show the **7-Step Forensic Investigation**, expanding Step 1 to reveal the exact parameterized SQL query and returned SQLite row.
  2. Click **`Math`** (Calculation Breakdown) $\to$ Show the decimal line-item arithmetic:
     $$\text{Gross Customer Inflow } - \text{Refunds } - \text{MDR Gateway Fee (2%)} - \text{GST (18%)} = \text{Expected Net} \iff \text{Bank Credit}$$
  3. Click **`Simulate`** (What-If Resolution Simulator) $\to$ Show the **Before vs. After** balance sheet projection, demonstrating the exact $+1.4\%$ close readiness boost before committing changes.

---

## 🎬 Act 5: Period Close Execution & Sign-Off (3:00 – 3:30)
**Screen:** `http://localhost:3000/` (Daily Close Command Center)

* **Visual Focus:**
  * The Hero **`Execute Period Close`** button.
* **Voiceover / Pitch:**
  > *"Finally, when it's time to close the books, the CFO doesn't have to guess."*
* **Interactive Action:**
  * Click **`Execute Period Close`**.
  * Show the **Fastest Route to Close (Pathfinder)** presenting Options A, B, and C ranked by exposure cleared and confidence.
  * Click **`Execute Route`** on Option A $\to$ The blocker is resolved, Cash-at-Risk clears to ₹0, and the status flips to **`READY TO CLOSE`** with an immutable audit hash.
  * End on the **Cash Intelligence (`/forecast`)** page showing the 30-day runway projection.

---

## 🚀 Production Launch Commands

To launch the hardened stack locally:

```bash
# Terminal 1: Launch FastAPI Backend
python -m uvicorn backend.app:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Launch Next.js Frontend
cd frontend
npm run dev
```

Or run via Docker Compose:

```bash
docker-compose up --build
```
