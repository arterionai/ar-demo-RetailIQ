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

app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program
{
}
