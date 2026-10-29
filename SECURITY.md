# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.1.x   | :white_check_mark: |
| < 1.1.0 | :x:                |

## Supply Chain Security Principles

`create-shadcn-js` adheres to strict security standards to ensure package and dependency integrity:

1. **Strict Input Sanitization**: All user inputs (project directory, components, flags, presets, package managers) are strictly validated against strict allowlists and regex patterns to prevent command injection, flag injection, and path traversal vulnerabilities.
2. **Zero Arbitrary Execution**: The package does not use `eval`, dynamic require, or shell string interpolation. All child processes use direct argument vector passing via `cross-spawn`.
3. **Dependency Integrity**: Dependencies are regularly audited for known CVEs. All dependencies must have verified registry signatures and 0 vulnerabilities reported by `npm audit`.
4. **Minimal Surface Area**: Export maps explicitly define public entrypoints, preventing unauthorized file access.

## Reporting a Vulnerability

If you discover a security vulnerability in this project:

1. Please do **not** open a public issue.
2. Send an email to **skandan.studio4as@gmail.com** with details of the vulnerability, proof of concept, and affected versions.
3. You will receive an initial response within 48 hours.
