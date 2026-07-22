# Palacio Returns Engineering Standards

- Use .NET 8 and nullable reference types.
- Keep domain rules in Palacio.Returns.Domain.
- Controllers must not contain business rules.
- Mobile applications must never call SAP directly.
- All return eligibility decisions must be made by Returns Orchestrator.
- Receiving an item is not equivalent to approving its inspection.
- Refund approval requires:
  1. approved store inspection;
  2. no blocked fraud review;
  3. valid original order;
  4. supported payment method.
- Add unit and integration tests for every change in return-state transitions.
- Reference the relevant ADR in pull-request descriptions.
