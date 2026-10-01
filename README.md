# onlychats
Website for chatting

## IFA Pattern Guide (`ifa/`)

A browser-based tool for evaluating HEp-2 indirect immunofluorescence (IFA / ANA) images.
Upload one or more images, answer the guided questions step by step, and the guide returns
the pattern name according to the International Consensus on ANA Patterns (ICAP, AC-0 … AC-29).

Features
- Upload multiple images (drag & drop); zoom, pan, brightness / contrast / grayscale
- Guided ICAP decision tree (nuclear, cytoplasmic, mitotic patterns)
- "Not sure" answers report at group (competent) level, e.g. *Nuclear speckled (AC-2 / AC-4 / AC-5 / AC-29)*
- Mixed patterns: add more than one finding per sample
- Pattern description, associated antigens and clinical associations
- Sample ID, substrate, titer and intensity; copy the report as text
- Opens with a synthetic example image so the guide can be tried right away
- Light and dark theme
- Keyboard: `1`–`9` choose an option, `Backspace` goes back

Run: open `ifa/index.html` in a browser (no build or server needed). Images never leave the device.

Live version: https://claude.ai/artifact/KuYn9Dq112pCxD6cNK9uda

> Decision-support tool for trained readers — not a diagnosis.
