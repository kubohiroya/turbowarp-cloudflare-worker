# Architecture

This repository currently keeps the normative architecture note in Japanese:

- [Cloudflare integration package architecture](architecture.ja.md)

The package separates Cloudflare Workers TypeScript/Hono generation, CLI output, and deployment-facing concerns from the core `turbowarp-http-server` repository.
