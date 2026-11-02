---
title: "radcheck"
summary: "Small local LLM that reviews Spanish radiology reports before they are signed and flags internal inconsistencies, like a linter for reports"
date: "Nov 01 2026"
draft: false
tags:
- Python
- PyTorch
- LLM
- Fine-tuning
- LoRA
- Hugging Face
- llama.cpp
- AI
repoUrl: https://github.com/crstian19/radcheck
icon: 'icon-[simple-icons--huggingface]'
# Fallback GitHub counts, refreshed from the API at build time and in the browser.
stars: 0
forks: 0
logo: ./logo.webp
---

<p align="center">
  <img src="https://raw.githubusercontent.com/crstian19/radcheck/main/docs/img/logo.png" alt="radcheck logo: a ferret in a lab coat with glasses and a radiation badge" width="480">
</p>

A small, local LLM that reviews **Spanish radiology reports** before they are signed and flags internal inconsistencies: swapped laterality, inverted negations, implausible measurements and findings missing from the conclusion. Think of it as a **linter for radiology reports**.

> **Research preview, not validated by a physician.** A learning project, not a medical device and not for clinical use. It only checks that a report is consistent with itself; it never judges whether a finding is clinically correct.

## Why

Radiologists dictate reports with speech recognition, and small errors slip through ("derecho" instead of "izquierdo", "no se observa" instead of "se observa"). Hospitals cannot send real reports to hosted LLM APIs, so a useful checker has to be **small enough to run on-premises**. Prior work (Sun et al., *Radiology* 2025) showed that fine-tuned open models trained on synthetic errors can beat GPT-4 at this task, in English. radcheck tries the same idea in Spanish with small models.

## How it works

- **Data**: Spanish radiology reports from the CARES dataset, split by report **before** any error is added, so the test set never leaks into training
- **Error injector**: rule-based, it adds realistic mistakes to clean reports and builds a 50% clean / 50% broken training set
- **Fine-tune**: LoRA on Qwen3.5 (4B and 9B); the current v4.1 averages the adapters of several training seeds (a *model soup*)
- **Evaluation**: on RadCheck-Bench-ES, an independent set of synthetic reports, plus an extra track of missing findings and dictation slips
- **Serving**: merged and quantised to GGUF, it runs with `llama-server` on a normal machine, no patient data leaves it

The model reads a report and answers with JSON, an empty list when the report is fine:

```json
{"errores": [{"tipo": "lateralidad", "fragmento": "derrame pleural izquierdo",
  "explicacion": "Los hallazgos describen el derrame en el lado derecho."}]}
```

## Results

| Model | Bench F1 | Extra F1 |
|---|---|---|
| Qwen3.5-4B + LoRA | 0.956 | 0.500 |
| Qwen3.5-4B GGUF (Q8_0 / Q4_K_M) | 0.956 / 0.953 | |
| Qwen3.5-9B + LoRA | 0.956 | 0.535 |
| Qwen3.5-9B GGUF (Q8_0 / Q4_K_M) | 0.959 / 0.944 | 0.552 / 0.494 |

<p align="center">
  <img src="https://raw.githubusercontent.com/crstian19/radcheck/main/docs/img/f1-injector-vs-bench.png" alt="F1 by model on the synthetic test set and on RadCheck-Bench-ES" width="800">
</p>

The models and the benchmark are on Hugging Face: [radcheck collection](https://huggingface.co/collections/Crstian19/radcheck-6ae5ae4780732cb99bf9bfa3) and [radcheck-bench-es](https://huggingface.co/datasets/Crstian19/radcheck-bench-es).

## How it is built

**Python + PyTorch**, managed with **uv**, with **Transformers**, **TRL** and **PEFT** for the LoRA training. It trains on an AMD RX 6800 with ROCm or on NVIDIA with CUDA, and exports to **GGUF** for **llama.cpp**.

## License

Code: MIT. The models, trained on CARES, inherit **CC BY-NC-SA 4.0** (non-commercial). The benchmark is CC BY 4.0 and has no patient data.
