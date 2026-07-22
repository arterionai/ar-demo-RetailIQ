namespace Palacio.Returns.Api.DTOs;

public record QrCodeResponseDto(string Token, DateTime ExpiresAtUtc);
