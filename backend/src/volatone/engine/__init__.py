"""Sonification engine: turns ticks and their features into note events.

Rule: pure functions and plain data in, plain data out. No network, no database,
no framework imports. That keeps it unit-testable and swappable (e.g. for a
compiled implementation later).
"""
