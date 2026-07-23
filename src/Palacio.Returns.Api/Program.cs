using Palacio.Returns.Domain.Abstractions;
using Palacio.Returns.Domain.Services;
using Palacio.Returns.Infrastructure.Fraud;
using Palacio.Returns.Infrastructure.Repositories;
using Palacio.Returns.Infrastructure.Sap;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

const string DemoWebClients = "DemoWebClients";
builder.Services.AddCors(options =>
{
    options.AddPolicy(DemoWebClients, policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddSingleton<IReturnRequestRepository, InMemoryReturnRequestRepository>();
builder.Services.AddScoped<IFraudReviewGateway, FraudReviewGateway>();
builder.Services.AddScoped<ISapFolioClient, SapFolioClient>();
builder.Services.AddScoped<QrCodeService>();
builder.Services.AddScoped<ReturnWorkflowService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(DemoWebClients);

app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program
{
}
