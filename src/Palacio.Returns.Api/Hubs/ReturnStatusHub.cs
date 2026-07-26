using Microsoft.AspNetCore.SignalR;

namespace Palacio.Returns.Api.Hubs;

/// <summary>
/// Canal en vivo de estatus de devoluciones. No contiene lógica de negocio — solo agrupa
/// conexiones por ID de devolución para que <see cref="Controllers.ReturnsController"/> pueda
/// transmitir el DTO actualizado justo después de cada acción real (recibir, inspeccionar, etc.).
/// </summary>
public class ReturnStatusHub : Hub
{
    public Task SubscribeToReturn(string returnId) =>
        Groups.AddToGroupAsync(Context.ConnectionId, returnId);
}
