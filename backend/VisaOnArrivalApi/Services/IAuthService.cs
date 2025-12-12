using VisaOnArrivalApi.DTOs.Auth;

namespace VisaOnArrivalApi.Services;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginRequestDto request);
    Task<LoginResponseDto?> SignupAsync(SignupRequestDto request);
    Task<LoginResponseDto?> GetCurrentUserAsync(int userId);
    string GenerateJwtToken(int userId, string email, string role, List<string> permissions);
}
