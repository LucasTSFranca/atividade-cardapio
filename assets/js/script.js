document.addEventListener('DOMContentLoaded', () => {
  const categoriaButtons = document.querySelectorAll('.categoria-btn');
  const buscaInput = document.getElementById('busca');
  const btnBuscar = document.getElementById('btnBuscar');
  const cards = document.querySelectorAll('.card');
  const carrinhoBody = document.querySelector('#carrinho tbody');

  let categoriaAtual = 'Todos';

  function formatMoney(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  function limparNumero(valor) {
    return Number(String(valor).replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
  }

  function atualizarFiltros() {
    const termo = buscaInput.value.trim().toLowerCase();

    cards.forEach((card) => {
      const coluna = card.closest('.col');
      if (!coluna) return;

      const nome = (card.querySelector('.card-title')?.textContent || '').toLowerCase();
      const categoria = (card.querySelector('.badge')?.textContent || '').trim();

      const categoriaOk = categoriaAtual === 'Todos' || categoria === categoriaAtual;
      const buscaOk = !termo || nome.includes(termo);

      coluna.style.display = categoriaOk && buscaOk ? '' : 'none';
    });
  }

  categoriaButtons.forEach((button) => {
    button.addEventListener('click', () => {
      categoriaButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      categoriaAtual = button.textContent.trim();
      atualizarFiltros();
    });
  });

  buscaInput.addEventListener('input', atualizarFiltros);
  btnBuscar.addEventListener('click', atualizarFiltros);

  function getProduto(card) {
    return {
      nome: card.querySelector('.card-title')?.textContent.trim() || 'Produto',
      categoria: card.querySelector('.badge')?.textContent.trim() || 'Sem categoria',
      preco: limparNumero(card.querySelector('.fs-5')?.textContent || 'R$ 0,00'),
      quantidadeEl: card.querySelector('.btn-group span')
    };
  }

  function atualizarQuantidadeNoCard(card, novaQuantidade) {
    const quantidadeEl = card.querySelector('.btn-group span');
    if (quantidadeEl) {
      quantidadeEl.textContent = Math.max(0, novaQuantidade);
    }
  }

  cards.forEach((card) => {
    const botoes = card.querySelectorAll('.btn-group .btn');

    botoes.forEach((botao) => {
      botao.addEventListener('click', () => {
        const quantidadeEl = card.querySelector('.btn-group span');
        let quantidade = Number(quantidadeEl.textContent.trim()) || 0;

        if (botao.querySelector('.bi-plus')) {
          quantidade += 1;
        }

        if (botao.querySelector('.bi-dash')) {
          quantidade = Math.max(0, quantidade - 1);
        }

        quantidadeEl.textContent = quantidade;
      });
    });
  });

  function encontrarLinhaCarrinho(nome) {
    return [...document.querySelectorAll('#carrinho tbody tr')].find((linha) => {
      return linha.dataset.produto === nome;
    });
  }

  function atualizarResumoCarrinho() {
    const linhas = document.querySelectorAll('#carrinho tbody tr');
    let subtotal = 0;

    linhas.forEach((linha) => {
      const preco = Number(linha.dataset.preco || 0);
      const quantidade = Number(linha.querySelector('.btn-group span')?.textContent.trim() || 0);
      subtotal += preco * quantidade;
    });

    const taxaEntrega = 8;
    const total = subtotal + taxaEntrega;

    const linhasResumo = document.querySelectorAll('#carrinho .p-3 > .d-flex');

    if (linhasResumo[0]) {
      linhasResumo[0].lastElementChild.textContent = formatMoney(subtotal);
    }

    if (linhasResumo[1]) {
      linhasResumo[1].lastElementChild.textContent = formatMoney(taxaEntrega);
    }

    if (linhasResumo[2]) {
      linhasResumo[2].lastElementChild.textContent = formatMoney(total);
    }
  }

  function bindCarrinhoActions() {
    const botoesMais = document.querySelectorAll('#carrinho tbody .btn-outline-danger');
    const botoesMenos = document.querySelectorAll('#carrinho tbody .btn-outline-success');
    const botoesExcluir = document.querySelectorAll('#carrinho tbody .btn-outline-danger.border-0');

    botoesMais.forEach((botao) => {
      botao.onclick = () => {
        const linha = botao.closest('tr');
        const quantidadeEl = linha.querySelector('.btn-group span');
        const quantidade = Number(quantidadeEl.textContent.trim()) || 0;
        quantidadeEl.textContent = quantidade + 1;
        linha.dataset.quantidade = quantidadeEl.textContent.trim();
        atualizarResumoCarrinho();
      };
    });

    botoesMenos.forEach((botao) => {
      botao.onclick = () => {
        const linha = botao.closest('tr');
        const quantidadeEl = linha.querySelector('.btn-group span');
        let quantidade = Number(quantidadeEl.textContent.trim()) || 0;
        quantidade = Math.max(0, quantidade - 1);
        quantidadeEl.textContent = quantidade;

        if (quantidade === 0) {
          linha.remove();
        }

        atualizarResumoCarrinho();
      };
    });

    botoesExcluir.forEach((botao) => {
      botao.onclick = () => {
        const linha = botao.closest('tr');
        if (linha) {
          linha.remove();
        }
        atualizarResumoCarrinho();
      };
    });
  }

  document.querySelectorAll('.card button').forEach((botao) => {
    if (!botao.querySelector('.bi-cart-plus')) return;

    botao.addEventListener('click', () => {
      const card = botao.closest('.card');
      const produto = getProduto(card);
      const quantidadeSelecionada = Number(produto.quantidadeEl?.textContent.trim() || 0);

      if (quantidadeSelecionada <= 0) {
        alert('Selecione pelo menos 1 unidade antes de adicionar ao carrinho.');
        return;
      }

      const linhaExistente = encontrarLinhaCarrinho(produto.nome);

      if (linhaExistente) {
        const quantidadeAtual = Number(linhaExistente.querySelector('.btn-group span')?.textContent.trim() || 0);
        const novaQuantidade = quantidadeAtual + quantidadeSelecionada;
        linhaExistente.querySelector('.btn-group span').textContent = novaQuantidade;
        linhaExistente.dataset.preco = String(produto.preco);
        const subtotalCell = linhaExistente.querySelectorAll('td')[3];
        subtotalCell.textContent = formatMoney(produto.preco * novaQuantidade);
      } else {
        const linha = document.createElement('tr');
        linha.dataset.produto = produto.nome;
        linha.dataset.preco = String(produto.preco);
        linha.innerHTML = `
          <td>
            <div class="d-flex align-items-center">
              <img src="${card.querySelector('img')?.src || ''}" class="rounded-3 me-3 object-fit-cover" style="width: 50px; height: 50px;" alt="${produto.nome}">
              <div>
                <h6 class="mb-0 fw-bold">${produto.nome}</h6>
                <small class="text-muted">${produto.categoria}</small>
              </div>
            </div>
          </td>
          <td class="text-center">
            <div class="btn-group btn-group-sm" role="group">
              <button type="button" class="btn btn-outline-success"><i class="bi bi-dash"></i></button>
              <span class="px-3 bg-white d-flex align-items-center fw-bold border border-secondary border-opacity-25">${quantidadeSelecionada}</span>
              <button type="button" class="btn btn-outline-danger"><i class="bi bi-plus"></i></button>
            </div>
          </td>
          <td class="text-end">${formatMoney(produto.preco)}</td>
          <td class="text-end fw-bold">${formatMoney(produto.preco * quantidadeSelecionada)}</td>
          <td class="text-center">
            <button type="button" class="btn btn-sm btn-outline-danger border-0"><i class="bi bi-trash fs-5"></i></button>
          </td>
        `;
        carrinhoBody.appendChild(linha);
      }

      atualizarQuantidadeNoCard(card, 0);
      bindCarrinhoActions();
      atualizarResumoCarrinho();
    });
  });

  bindCarrinhoActions();
  atualizarResumoCarrinho();
});
