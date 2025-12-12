using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using VisaOnArrivalApi.Data;
using VisaOnArrivalApi.DTOs.Auth;
using VisaOnArrivalApi.Models;

namespace VisaOnArrivalApi.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    public AuthService(ApplicationDbContext context, IConfiguration configuration, ILogger<AuthService> logger)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request)
    {
        try
        {
            _logger.LogInformation("Login attempt for email: {Email}", request.Email);

            // Find user by email
            var user = await _context.Users
                .Include(u => u.UserPermissions)
                    .ThenInclude(up => up.Permission)
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                _logger.LogWarning("Login failed: User not found for email: {Email}", request.Email);
                return null;
            }

            // Verify password
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                _logger.LogWarning("Login failed: Invalid password for email: {Email}", request.Email);
                return null;
            }

            // Check if user is active
            if (!user.IsActive)
            {
                _logger.LogWarning("Login failed: User account is inactive for email: {Email}", request.Email);
                return null;
            }

            // Get user permissions
            var permissions = user.UserPermissions
                .Where(up => up.Permission.IsActive)
                .Select(up => up.Permission.Name)
                .ToList();

            // Generate JWT token
            var token = GenerateJwtToken(user.Id, user.Email, user.Role.ToString(), permissions);

            _logger.LogInformation("Login successful for email: {Email}", request.Email);

            return new LoginResponseDto
            {
                Token = token,
                UserId = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role.ToString(),
                Permissions = permissions
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for email: {Email}", request.Email);
            throw;
        }
    }

    public async Task<LoginResponseDto?> SignupAsync(SignupRequestDto request)
    {
        try
        {
            _logger.LogInformation("Signup attempt for email: {Email}", request.Email);

            // Check if user already exists
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (existingUser != null)
            {
                _logger.LogWarning("Signup failed: Email already exists: {Email}", request.Email);
                return null;
            }

            // Create new user with Role = User (ordinary user)
            var user = new User
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = UserRole.User, // Ordinary users sign up with User role
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                EmployeeId = null, // Ordinary users don't have employee IDs
                Department = null
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Signup successful for email: {Email}, User ID: {UserId}", request.Email, user.Id);

            // Generate JWT token
            var token = GenerateJwtToken(user.Id, user.Email, user.Role.ToString(), new List<string>());

            return new LoginResponseDto
            {
                Token = token,
                UserId = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role.ToString(),
                Permissions = new List<string>() // Ordinary users don't have permissions
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during signup for email: {Email}", request.Email);
            throw;
        }
    }

    public async Task<LoginResponseDto?> GetCurrentUserAsync(int userId)
    {
        try
        {
            var user = await _context.Users
                .Include(u => u.UserPermissions)
                    .ThenInclude(up => up.Permission)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null || !user.IsActive)
            {
                return null;
            }

            var permissions = user.UserPermissions
                .Where(up => up.Permission.IsActive)
                .Select(up => up.Permission.Name)
                .ToList();

            var token = GenerateJwtToken(user.Id, user.Email, user.Role.ToString(), permissions);

            return new LoginResponseDto
            {
                Token = token,
                UserId = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role.ToString(),
                Permissions = permissions
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current user for userId: {UserId}", userId);
            throw;
        }
    }

    public string GenerateJwtToken(int userId, string email, string role, List<string> permissions)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT Secret Key not configured");
        var issuer = jwtSettings["Issuer"] ?? "VisaOnArrivalApi";
        var audience = jwtSettings["Audience"] ?? "VisaOnArrivalClient";
        var expiryMinutes = int.Parse(jwtSettings["ExpiryMinutes"] ?? "1440"); // 24 hours default

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, role),
            new Claim("userId", userId.ToString()),
            new Claim("email", email),
            new Claim("role", role)
        };

        // Add permissions as claims
        foreach (var permission in permissions)
        {
            claims.Add(new Claim("permission", permission));
        }

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
