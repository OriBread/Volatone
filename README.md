# HarmoniQuant

> **Status:** **Active Work-in-Progress (Summer 2026)** 
> This repository is an ongoing personal project focused on merging high-performance systems engineering with algorithmic music theory. Under active construction (WIP 🙏)

HarmoniQuant is a real-time data translation framework designed to ingest high-frequency market data (L3 cryptocurrency tick feeds) and algorithmically transform order book dynamics into live, multi-instrument musical compositions. 

Rather than simply mapping a lagging closing price to a basic sound graph, this project aims to sonify the underlying **market behavior, liquidity depth, and order book velocity**. The end goal is to interpret these financial microstructural patterns through the rulesets of harmonic music theory, and *(hopefully)* make some pleasant-sounding music from the madness.

I plan to make a standalone native executable first, with a possibility of a single-threaded *(or multi if i decide to mess around with COOP/COEP headers)* WASM version later after some performance testing.


### Technical Stack
* **C++20:** Ingestion pipeline, L3 tick parsing, and rolling microstructure feature extraction.
* **WebAssembly (Emscripten):** Cross-compilation target for executing the native C++ calculation engine in the browser runtime.
* **TypeScript & Tone.js:** Asynchronous event scheduling, musical grid quantisation, and audio synthesis.
