export default function App() {
  return (
    <main className="app">
      <header className="app__header">
        <p className="app__badge">Stack definida</p>
        <h1>Projeto Alalala</h1>
        <p>
          Frontend em React/Vite, backend em Node/Express e banco SQLite com
          migrações via Knex.
        </p>
      </header>
      <section className="app__section">
        <h2>Endpoints</h2>
        <ul>
          <li>
            <strong>GET /health</strong> — estado do backend
          </li>
          <li>
            <strong>GET /health/db</strong> — verificação de conexão com o banco
          </li>
        </ul>
      </section>
    </main>
  );
}
