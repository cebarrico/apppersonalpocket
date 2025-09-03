import { getUser } from "@/lib/auth-actions";
import { ServerUser } from "./ServerUser";
import { ClientAuthInfo } from "./ClientAuthInfo";

// Server Component que mostra informações do usuário
export async function AuthExample() {
  const user = await getUser();

  return (
    <div className="space-y-6 p-6 bg-medium-blue-gray rounded-lg">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-ice-white mb-2">
          Exemplo de Autenticação
        </h2>
        <p className="text-light-gray-text">
          Demonstração de autenticação com cookies no servidor e cliente
        </p>
      </div>

      {/* Informações do servidor */}
      <div className="space-y-4">
        <div className="bg-light-gray/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-ice-white mb-2">
            🔒 Dados do Servidor (Server Component)
          </h3>
          {user ? (
            <div className="space-y-2">
              <p className="text-ice-white">
                <span className="font-medium">Nome:</span> {user.full_name}
              </p>
              <p className="text-ice-white">
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p className="text-ice-white">
                <span className="font-medium">Role:</span> {user.role}
              </p>
              <p className="text-ice-white">
                <span className="font-medium">ID:</span> {user.id}
              </p>
            </div>
          ) : (
            <p className="text-coral-red">
              Usuário não autenticado no servidor
            </p>
          )}
        </div>

        {/* Componente servidor */}
        <div className="bg-light-gray/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-ice-white mb-2">
            📡 Componente Servidor
          </h3>
          <ServerUser />
        </div>

        {/* Componente cliente */}
        <div className="bg-light-gray/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-ice-white mb-2">
            💻 Componente Cliente
          </h3>
          <ClientAuthInfo />
        </div>
      </div>

      {/* Informações técnicas */}
      <div className="bg-aqua/10 p-4 rounded-lg border border-aqua/20">
        <h3 className="text-lg font-semibold text-aqua mb-2">
          ℹ️ Informações Técnicas
        </h3>
        <div className="space-y-2 text-sm text-ice-white">
          <p>
            • <strong>Server Component:</strong> Dados obtidos no servidor
            usando cookies
          </p>
          <p>
            • <strong>Client Component:</strong> Dados obtidos no cliente via
            AuthContext
          </p>
          <p>
            • <strong>Cookies:</strong> Persistência automática entre servidor e
            cliente
          </p>
          <p>
            • <strong>Middleware:</strong> Proteção automática de rotas
          </p>
        </div>
      </div>
    </div>
  );
}
