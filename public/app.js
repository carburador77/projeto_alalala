const teamSelect = document.querySelector("#team-select");
const teamList = document.querySelector("#european-teams");
const matchForm = document.querySelector("#match-form");
const matchIdField = document.querySelector("#match-id");
const resetButton = document.querySelector("#reset-form");
const matchesList = document.querySelector("#matches-list");
const formFeedback = document.querySelector("#form-feedback");

const teams = [
  "Arsenal",
  "Aston Villa",
  "Atalanta",
  "Atlético de Madrid",
  "Barcelona",
  "Bayern de Munique",
  "Benfica",
  "Borussia Dortmund",
  "Chelsea",
  "Club Brugge",
  "Eintracht Frankfurt",
  "Feyenoord",
  "Inter de Milão",
  "Juventus",
  "Lazio",
  "Liverpool",
  "Manchester City",
  "Manchester United",
  "Milan",
  "Monaco",
  "Napoli",
  "Olympique de Marseille",
  "Paris Saint-Germain",
  "Porto",
  "RB Leipzig",
  "Real Madrid",
  "Real Sociedad",
  "Roma",
  "Sporting",
  "Tottenham",
  "Union Berlin",
  "Villarreal",
];

const numericFieldIds = [
  "score-home",
  "score-away",
  "possession",
  "xg",
  "shots",
  "shots-on-target",
  "corners",
  "fouls",
  "yellow-cards",
  "red-cards",
  "passes",
  "pass-accuracy",
];

const populateTeams = () => {
  teamList.innerHTML = teams
    .map((team) => `<option value="${team}"></option>`)
    .join("");
};

const setFeedback = (message, tone = "info") => {
  formFeedback.textContent = message;
  formFeedback.dataset.tone = tone;
};

const clearFeedback = () => {
  formFeedback.textContent = "";
  formFeedback.dataset.tone = "";
};

const formatValue = (value, suffix = "") =>
  value === null || value === undefined || value === ""
    ? "-"
    : `${value}${suffix}`;

const matchRow = (match) => `
  <article class="match-card">
    <header>
      <div>
        <h3>${match.team} x ${match.opponent}</h3>
        <p>${match.date ? match.date : "Data não informada"}</p>
      </div>
      <div class="score">
        ${formatValue(match.scoreHome)} - ${formatValue(match.scoreAway)}
      </div>
    </header>
    <div class="stats-grid">
      <div>
        <span>Posse</span>
        <strong>${formatValue(match.possession, "%")}</strong>
      </div>
      <div>
        <span>xG</span>
        <strong>${formatValue(match.xg)}</strong>
      </div>
      <div>
        <span>Finalizações</span>
        <strong>${formatValue(match.shots)}</strong>
      </div>
      <div>
        <span>No alvo</span>
        <strong>${formatValue(match.shotsOnTarget)}</strong>
      </div>
      <div>
        <span>Escanteios</span>
        <strong>${formatValue(match.corners)}</strong>
      </div>
      <div>
        <span>Faltas</span>
        <strong>${formatValue(match.fouls)}</strong>
      </div>
      <div>
        <span>Amarelos</span>
        <strong>${formatValue(match.yellowCards)}</strong>
      </div>
      <div>
        <span>Vermelhos</span>
        <strong>${formatValue(match.redCards)}</strong>
      </div>
      <div>
        <span>Passes</span>
        <strong>${formatValue(match.passes)}</strong>
      </div>
      <div>
        <span>Precisão</span>
        <strong>${formatValue(match.passAccuracy, "%")}</strong>
      </div>
    </div>
    <footer>
      <button class="ghost-button" data-action="edit" data-id="${match.id}">
        Editar
      </button>
      <button class="danger-button" data-action="delete" data-id="${match.id}">
        Excluir
      </button>
    </footer>
  </article>
`;

const fetchMatches = async () => {
  const response = await fetch("/api/matches");
  if (!response.ok) {
    throw new Error("Falha ao carregar partidas.");
  }
  return response.json();
};

const renderMatches = async () => {
  try {
    const matches = await fetchMatches();
    if (!matches.length) {
      matchesList.innerHTML = `
        <div class="empty-state">
          <p>Nenhuma partida cadastrada ainda.</p>
        </div>
      `;
      return;
    }
    matchesList.innerHTML = matches.map(matchRow).join("");
  } catch (error) {
    matchesList.innerHTML = `
      <div class="empty-state error">
        <p>${error.message}</p>
      </div>
    `;
  }
};

const collectFormData = () => {
  const formData = new FormData(matchForm);
  const payload = Object.fromEntries(formData.entries());

  numericFieldIds.forEach((id) => {
    const input = document.querySelector(`#${id}`);
    payload[input.name] = input.value === "" ? null : Number(input.value);
  });

  payload.team = payload.team?.trim();
  payload.opponent = payload.opponent?.trim();
  return payload;
};

const fillForm = (match) => {
  matchIdField.value = match.id;
  matchForm.team.value = match.team;
  matchForm.opponent.value = match.opponent;
  matchForm.date.value = match.date ?? "";
  matchForm.scoreHome.value = match.scoreHome ?? "";
  matchForm.scoreAway.value = match.scoreAway ?? "";
  matchForm.possession.value = match.possession ?? "";
  matchForm.xg.value = match.xg ?? "";
  matchForm.shots.value = match.shots ?? "";
  matchForm.shotsOnTarget.value = match.shotsOnTarget ?? "";
  matchForm.corners.value = match.corners ?? "";
  matchForm.fouls.value = match.fouls ?? "";
  matchForm.yellowCards.value = match.yellowCards ?? "";
  matchForm.redCards.value = match.redCards ?? "";
  matchForm.passes.value = match.passes ?? "";
  matchForm.passAccuracy.value = match.passAccuracy ?? "";
  setFeedback("Editando partida selecionada.", "info");
};

const resetForm = () => {
  matchForm.reset();
  matchIdField.value = "";
  clearFeedback();
};

const saveMatch = async (payload) => {
  const method = matchIdField.value ? "PUT" : "POST";
  const endpoint = matchIdField.value
    ? `/api/matches/${matchIdField.value}`
    : "/api/matches";
  const response = await fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao salvar.");
  }
  return response.json();
};

const deleteMatch = async (id) => {
  const response = await fetch(`/api/matches/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao excluir.");
  }
};

matchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearFeedback();
  try {
    const payload = collectFormData();
    await saveMatch(payload);
    setFeedback("Partida salva com sucesso!", "success");
    resetForm();
    await renderMatches();
  } catch (error) {
    setFeedback(error.message, "error");
  }
});

resetButton.addEventListener("click", () => {
  resetForm();
});

matchesList.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  const { action, id } = button.dataset;
  if (action === "edit") {
    const matches = await fetchMatches();
    const match = matches.find((item) => item.id === id);
    if (match) {
      fillForm(match);
      matchForm.scrollIntoView({ behavior: "smooth" });
    }
  }

  if (action === "delete") {
    try {
      await deleteMatch(id);
      await renderMatches();
    } catch (error) {
      setFeedback(error.message, "error");
    }
  }
});

teamSelect.addEventListener("change", () => {
  matchForm.team.value = teamSelect.value;
});

populateTeams();
renderMatches();
