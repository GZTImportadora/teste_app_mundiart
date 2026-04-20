let PARAMS = {};

function clonar(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function mergeDeep(target, source) {
    if (!source || typeof source !== "object") return target;
    Object.keys(source).forEach((key) => {
        const sourceValue = source[key];
        if (Array.isArray(sourceValue)) {
            target[key] = sourceValue.slice();
        } else if (sourceValue && typeof sourceValue === "object") {
            if (!target[key] || typeof target[key] !== "object" || Array.isArray(target[key])) {
                target[key] = {};
            }
            mergeDeep(target[key], sourceValue);
        } else {
            target[key] = sourceValue;
        }
    });
    return target;
}

function valorNumero(id, padrao = 0) {
    const el = document.getElementById(id);
    if (!el) return padrao;
    const txt = String(el.value ?? "").trim().replace(",", ".");
    const num = parseFloat(txt);
    return Number.isFinite(num) ? num : padrao;
}

function formatarNumeroBR(valor, casas = 2) {
    if (valor === null || valor === undefined || Number.isNaN(Number(valor))) return "";
    return Number(valor).toLocaleString("pt-BR", {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas
    });
}

function formatarInteiro(valor) {
    return Math.round(valor).toLocaleString("pt-BR", {
        maximumFractionDigits: 0
    });
}

function lerPercentual(id) {
    const el = document.getElementById(id);
    let valor = String(el?.value ?? "").trim();
    if (valor === "") return null;
    valor = valor.replace("%", "").replace(",", ".");
    const numero = parseFloat(valor);
    return Number.isFinite(numero) ? numero / 100 : null;
}

function getRaw(path, fallback = null) {
    let atual = PARAMS;
    for (const chave of path.split(".")) {
        if (atual == null || !(chave in atual)) return fallback;
        atual = atual[chave];
    }
    return atual;
}

function getValor(path, fallback = 0) {
    const valor = getRaw(path, fallback);
    if (valor && typeof valor === "object" && "valor" in valor) {
        return Number(valor.valor) || 0;
    }
    return Number(valor) || 0;
}

function garantirEstruturaValor(path) {
    const chaves = path.split(".");
    let atual = PARAMS;
    for (let i = 0; i < chaves.length - 1; i++) {
        const chave = chaves[i];
        if (!atual[chave] || typeof atual[chave] !== "object" || Array.isArray(atual[chave])) {
            atual[chave] = {};
        }
        atual = atual[chave];
    }
    return { atual, ultima: chaves[chaves.length - 1] };
}

function setValor(path, valor) {
    const { atual, ultima } = garantirEstruturaValor(path);
    if (atual[ultima] && typeof atual[ultima] === "object" && "valor" in atual[ultima]) {
        atual[ultima].valor = Number(valor) || 0;
    } else if (typeof atual[ultima] === "object" && atual[ultima] !== null && !Array.isArray(atual[ultima])) {
        atual[ultima].valor = Number(valor) || 0;
    } else {
        atual[ultima] = Number(valor) || 0;
    }
}

function setCampo(id, valor) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = valor ?? "";
}

function getCampoNumero(id) {
    return parseFloat(document.getElementById(id)?.value) || 0;
}

async function carregarParametros() {
    let base = {};
    try {
        const resp = await fetch("parametros.json", { cache: "no-store" });
        if (!resp.ok) throw new Error("Falha ao carregar JSON");
        base = await resp.json();
    } catch {
        base = {};
    }

    const local = localStorage.getItem("parametros");
    if (local) {
        try {
            const override = JSON.parse(local);
            PARAMS = mergeDeep(clonar(base), override);
        } catch {
            PARAMS = clonar(base);
        }
    } else {
        PARAMS = clonar(base);
    }

    if (!PARAMS.defaultsTela) {
        PARAMS.defaultsTela = {
            ii: 25,
            ipi: 7,
            agente: 5,
            margem: 27,
            usdDespacho: 6.1,
            usd30: 6.1,
            usd70: 6.1
        };
    }

    if (!PARAMS.pagamento) {
        PARAMS.pagamento = {
            DP: { fechamentoCambio: 250, cartaCredito: 0 },
            CC: { fechamentoCambio: 0, cartaCredito: 300 }
        };
    }
}

function preencherPortos() {
    const select = document.getElementById("porto");
    if (!select) return;

    const portos = Array.isArray(PARAMS.portos) ? PARAMS.portos : [];
    if (!portos.length) return;

    const valorSelecionado = select.value;
    select.innerHTML = "";

    portos.forEach((porto) => {
        const option = document.createElement("option");
        option.value = porto.nome;
        option.textContent = porto.nome;
        option.dataset.cbm = porto.cbm ?? "";
        option.dataset.frete = porto.freteUsdPadrao ?? "";
        option.dataset.peso = porto.peso ?? "";
        select.appendChild(option);
    });

    if (valorSelecionado) {
        const existe = portos.some((p) => p.nome === valorSelecionado);
        if (existe) select.value = valorSelecionado;
    }
}

function aplicarFretePadraoDoPorto(forcar = false) {
    const select = document.getElementById("porto");
    const frete = document.getElementById("frete");
    if (!select || !frete) return;
    const option = select.options[select.selectedIndex];
    if (!option) return;
    const valorAtual = String(frete.value ?? "").trim();
    if (forcar || valorAtual === "") {
        if (option.dataset.frete) frete.value = option.dataset.frete;
    }
}

function aplicarParametrosNaTela() {
    const defaults = PARAMS.defaultsTela || {};
    setCampo("ii", defaults.ii);
    setCampo("ipi", defaults.ipi);
    setCampo("agente", defaults.agente);
    setCampo("margem", defaults.margem);
    setCampo("usdDespacho", defaults.usdDespacho);
    setCampo("usd30", defaults.usd30);
    setCampo("usd70", defaults.usd70);
    aplicarFretePadraoDoPorto(false);
}

function abrirParametros() {
    setCampo("p_pis", getValor("tributos.pis"));
    setCampo("p_cofins", getValor("tributos.cofins"));
    setCampo("p_icmsImportacao", getValor("tributos.icmsImportacao"));
    setCampo("p_icmsVenda", getValor("tributos.icmsVenda"));
    setCampo("p_icmsIntraSt", getValor("tributos.icmsIntraSt"));
    setCampo("p_cpmf", getValor("tributos.cpmf"));

    setCampo("p_armazenagemPct", getValor("despacho.armazenagemPct"));
    setCampo("p_desembaraco", getValor("despacho.desembaraco"));
    setCampo("p_adicionalCofinsPct", getValor("despacho.adicionalCofinsPct"));
    setCampo("p_thcBL", getValor("despacho.thcBL"));
    setCampo("p_desova", getValor("despacho.desova"));
    setCampo("p_desconsolidacao", getValor("despacho.desconsolidacao"));
    setCampo("p_afrmmPct", getValor("despacho.afrmmPct"));
    setCampo("p_emissaoDI", getValor("despacho.emissaoDI"));
    setCampo("p_transporteInterno", getValor("despacho.transporteInterno"));
    setCampo("p_tagsEtiquetas", getValor("despacho.tagsEtiquetas"));

    setCampo("p_freteCambioFator", getValor("cambio.freteCambioFator"));
    setCampo("p_splitCambio30", getValor("cambio.splitCambio30"));
    setCampo("p_splitCambio70", getValor("cambio.splitCambio70"));

    setCampo("p_dpFechamentoCambio", Number(PARAMS.pagamento?.DP?.fechamentoCambio) || 0);
    setCampo("p_dpCartaCredito", Number(PARAMS.pagamento?.DP?.cartaCredito) || 0);
    setCampo("p_ccFechamentoCambio", Number(PARAMS.pagamento?.CC?.fechamentoCambio) || 0);
    setCampo("p_ccCartaCredito", Number(PARAMS.pagamento?.CC?.cartaCredito) || 0);

    setCampo("p_encargoCanalPct", getValor("comercial.encargoCanalPct"));
    setCampo("p_descontoGrazziotinPct", getValor("comercial.descontoGrazziotinPct"));
    setCampo("p_margemTeste15Fator", getValor("comercial.margemTeste15Fator"));
    setCampo("p_margemTeste29Fator", getValor("comercial.margemTeste29Fator"));

    setCampo("p_ii", PARAMS.defaultsTela?.ii);
    setCampo("p_ipi", PARAMS.defaultsTela?.ipi);
    setCampo("p_agente", PARAMS.defaultsTela?.agente);
    setCampo("p_margem", PARAMS.defaultsTela?.margem);
    setCampo("p_usdDespacho", PARAMS.defaultsTela?.usdDespacho);
    setCampo("p_usd30", PARAMS.defaultsTela?.usd30);
    setCampo("p_usd70", PARAMS.defaultsTela?.usd70);

    new bootstrap.Modal(document.getElementById("modalParametros")).show();
}

function salvarParametros() {
    setValor("tributos.pis", getCampoNumero("p_pis"));
    setValor("tributos.cofins", getCampoNumero("p_cofins"));
    setValor("tributos.icmsImportacao", getCampoNumero("p_icmsImportacao"));
    setValor("tributos.icmsVenda", getCampoNumero("p_icmsVenda"));
    setValor("tributos.icmsIntraSt", getCampoNumero("p_icmsIntraSt"));
    setValor("tributos.cpmf", getCampoNumero("p_cpmf"));

    setValor("despacho.armazenagemPct", getCampoNumero("p_armazenagemPct"));
    setValor("despacho.desembaraco", getCampoNumero("p_desembaraco"));
    setValor("despacho.adicionalCofinsPct", getCampoNumero("p_adicionalCofinsPct"));
    setValor("despacho.thcBL", getCampoNumero("p_thcBL"));
    setValor("despacho.desova", getCampoNumero("p_desova"));
    setValor("despacho.desconsolidacao", getCampoNumero("p_desconsolidacao"));
    setValor("despacho.afrmmPct", getCampoNumero("p_afrmmPct"));
    setValor("despacho.emissaoDI", getCampoNumero("p_emissaoDI"));
    setValor("despacho.transporteInterno", getCampoNumero("p_transporteInterno"));
    setValor("despacho.tagsEtiquetas", getCampoNumero("p_tagsEtiquetas"));

    setValor("cambio.freteCambioFator", getCampoNumero("p_freteCambioFator"));
    setValor("cambio.splitCambio30", getCampoNumero("p_splitCambio30"));
    setValor("cambio.splitCambio70", getCampoNumero("p_splitCambio70"));

    if (!PARAMS.pagamento || typeof PARAMS.pagamento !== "object") PARAMS.pagamento = {};
    PARAMS.pagamento.DP = {
        fechamentoCambio: getCampoNumero("p_dpFechamentoCambio"),
        cartaCredito: getCampoNumero("p_dpCartaCredito")
    };
    PARAMS.pagamento.CC = {
        fechamentoCambio: getCampoNumero("p_ccFechamentoCambio"),
        cartaCredito: getCampoNumero("p_ccCartaCredito")
    };

    setValor("comercial.encargoCanalPct", getCampoNumero("p_encargoCanalPct"));
    setValor("comercial.descontoGrazziotinPct", getCampoNumero("p_descontoGrazziotinPct"));
    setValor("comercial.margemTeste15Fator", getCampoNumero("p_margemTeste15Fator"));
    setValor("comercial.margemTeste29Fator", getCampoNumero("p_margemTeste29Fator"));

    PARAMS.defaultsTela = {
        ii: getCampoNumero("p_ii"),
        ipi: getCampoNumero("p_ipi"),
        agente: getCampoNumero("p_agente"),
        margem: getCampoNumero("p_margem"),
        usdDespacho: getCampoNumero("p_usdDespacho"),
        usd30: getCampoNumero("p_usd30"),
        usd70: getCampoNumero("p_usd70")
    };

    localStorage.setItem("parametros", JSON.stringify(PARAMS));
    aplicarParametrosNaTela();

    const modalEl = document.getElementById("modalParametros");
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
}

function obterPortoSelecionado() {
    const select = document.getElementById("porto");
    if (!select) return { nome: "", cbm: 0, freteUsdPadrao: 0, peso: 0 };
    const option = select.options[select.selectedIndex];
    if (!option) return { nome: "", cbm: 0, freteUsdPadrao: 0, peso: 0 };

    const nomeSelecionado = String(option.value || "").trim().toLowerCase();
    const portos = Array.isArray(PARAMS.portos) ? PARAMS.portos : [];

    const encontrado = portos.find((p) => String(p.nome || "").trim().toLowerCase() === nomeSelecionado);

    if (encontrado) return encontrado;

    return {
        nome: option.value,
        cbm: parseFloat(option.dataset.cbm) || 0,
        freteUsdPadrao: parseFloat(option.dataset.frete) || 0,
        peso: parseFloat(option.dataset.peso) || 0
    };
}

function obterPayment() {
    return PARAMS.pagamentoPadrao || "DP";
}

function calcularST(custoTotal, stPct, icmsIntraSt) {
    if (stPct === null || !Number.isFinite(stPct) || stPct <= 0) {
        return {
            baseST: 0,
            valorST: 0,
            custoTotalComST: custoTotal
        };
    }

    const baseST = custoTotal * (1 + stPct);
    const valorST = Math.max((baseST * icmsIntraSt) - (custoTotal * icmsIntraSt), 0);
    const custoTotalComST = custoTotal + valorST;

    return {
        baseST,
        valorST,
        custoTotalComST
    };
}

function calcular() {
    const resultado = document.getElementById("resultado");

    const fob = valorNumero("fob");
    const cbmCaixa = valorNumero("cbmCaixa");
    const pecasCaixa = valorNumero("pecasCaixa");
    const usdFrete = valorNumero("frete");

    const ii = valorNumero("ii") / 100;
    const ipi = valorNumero("ipi") / 100;
    const agente = valorNumero("agente") / 100;
    const margem = valorNumero("margem") / 100;

    const usdDespacho = valorNumero("usdDespacho");
    const usd30 = valorNumero("usd30");
    const usd70 = valorNumero("usd70");

    const st = lerPercentual("st");
    const payment = obterPayment();

    const porto = obterPortoSelecionado();
    const cbmContainer = Number(porto.cbm) || 0;

    const pis = getValor("tributos.pis");
    const cofins = getValor("tributos.cofins");
    const icmsImportacao = getValor("tributos.icmsImportacao");
    const icmsVenda = getValor("tributos.icmsVenda");
    const icmsIntraSt = getValor("tributos.icmsIntraSt");
    const cpmf = getValor("tributos.cpmf");

    const armazenagemPct = getValor("despacho.armazenagemPct");
    const desembaraco = getValor("despacho.desembaraco");
    const adicionalCofinsPct = getValor("despacho.adicionalCofinsPct");
    const thcBL = getValor("despacho.thcBL");
    const desova = getValor("despacho.desova");
    const desconsolidacao = getValor("despacho.desconsolidacao");
    const afrmmPct = getValor("despacho.afrmmPct");
    const emissaoDI = getValor("despacho.emissaoDI");
    const transporteInterno = getValor("despacho.transporteInterno");
    const tagsEtiquetas = getValor("despacho.tagsEtiquetas");

    const freteCambioFator = getValor("cambio.freteCambioFator", 1.1);
    const splitCambio30 = getValor("cambio.splitCambio30", 0.3);
    const splitCambio70 = getValor("cambio.splitCambio70", 0.7);

    const encargoCanalPct = getValor("comercial.encargoCanalPct", 0.0925);
    const descontoGrazziotinPct = getValor("comercial.descontoGrazziotinPct", 0.25);
    const margemTeste15Fator = getValor("comercial.margemTeste15Fator", 0.85);
    const margemTeste29Fator = getValor("comercial.margemTeste29Fator", 0.96);

    const fechamentoCambio = Number(PARAMS.pagamento?.[payment]?.fechamentoCambio) || 0;
    const cartaCredito = Number(PARAMS.pagamento?.[payment]?.cartaCredito) || 0;

    if (!fob || !cbmCaixa || !pecasCaixa || !cbmContainer) {
        resultado.innerHTML = `<tr><td colspan="2">Preencha os campos obrigatórios para calcular.</td></tr>`;
        return;
    }

    const quantidadeCaixas = cbmContainer / cbmCaixa;
    const pecasContainer = quantidadeCaixas * pecasCaixa;

    const produtoFOBUSD = pecasContainer * fob;
    const seguroUSD = 0;
    const cifUSD = produtoFOBUSD + usdFrete + seguroUSD;

    const produtoFOBBRL =
        (produtoFOBUSD * splitCambio30 * usd30) +
        (produtoFOBUSD * splitCambio70 * usd70);

    const freteBRL = usdFrete * usdDespacho * freteCambioFator;
    const seguroBRL = seguroUSD * usdDespacho;
    const cifBRL = produtoFOBBRL + freteBRL + seguroBRL;

    const valorII = cifBRL * ii;
    const valorIPIImport = (cifBRL + valorII) * ipi;

    const basePisCofins =
        cifBRL * (1 + (icmsImportacao * (ii + ipi * (1 + ii)))) /
        ((1 - pis - cofins) * (1 - icmsImportacao));

    const valorPIS = pis * basePisCofins;
    const valorCOFINS = cofins * basePisCofins;

    const valorArmazenagem = armazenagemPct * cifBRL;
    const valorAdicionalCofins = adicionalCofinsPct * basePisCofins;
    const valorAFRMM = afrmmPct * freteBRL;

    const subtotalDespacho =
        valorArmazenagem +
        desembaraco +
        valorAdicionalCofins +
        thcBL +
        desova +
        desconsolidacao +
        valorAFRMM +
        emissaoDI +
        fechamentoCambio +
        cartaCredito;

    const valorICMSImport =
        ((cifBRL + valorII + valorIPIImport + valorPIS + valorCOFINS + subtotalDespacho) / 0.7375) *
        icmsImportacao;

    const custoTotal =
        cifBRL +
        valorII +
        valorIPIImport +
        valorPIS +
        valorCOFINS +
        subtotalDespacho +
        valorICMSImport +
        transporteInterno +
        tagsEtiquetas;

    const stCalc = calcularST(custoTotal, st, icmsIntraSt);
    const custoTotalAjustado = stCalc.custoTotalComST;

    const valorUsadoCalculo =
        custoTotalAjustado -
        valorICMSImport -
        valorIPIImport -
        valorPIS -
        valorCOFINS;

    const coeficiente = 1 - (icmsVenda + cofins + pis + cpmf + margem);
    const custoVendaCliente = coeficiente !== 0 ? valorUsadoCalculo / coeficiente : 0;

    const valorICMSVenda = custoVendaCliente * icmsVenda;
    const valorCofinsVenda = custoVendaCliente * cofins;
    const valorPisVenda = custoVendaCliente * pis;
    const valorLucro = custoVendaCliente * margem;
    const valorCPMF = custoVendaCliente * cpmf;
    const valorAgente = custoVendaCliente * agente;
    const valorIPIComercial = custoVendaCliente * ipi;

    const subtotalVendaSemIPI =
        custoVendaCliente +
        valorICMSVenda +
        valorCofinsVenda +
        valorPisVenda +
        valorLucro +
        valorCPMF +
        valorAgente;

    const subtotalVendaComIPI = subtotalVendaSemIPI + valorIPIComercial;

    const precoVenda = pecasContainer ? subtotalVendaSemIPI / pecasContainer : 0;
    const precoVendaIPI = pecasContainer ? subtotalVendaComIPI / pecasContainer : 0;

    const custoUnitarioBase = pecasContainer ? valorUsadoCalculo / pecasContainer : 0;
    const custoUnitarioFinal = pecasContainer ? custoTotalAjustado / pecasContainer : 0;

    const precoGrazziotin = precoVenda * (1 - descontoGrazziotinPct);
    const baseMargem15 = precoVenda * margemTeste15Fator;
    const baseMargem29 = precoGrazziotin * margemTeste29Fator;

    const receitaLiquida15 = st === null
        ? baseMargem15 - (baseMargem15 * (encargoCanalPct + icmsVenda))
        : baseMargem15 - (baseMargem15 * encargoCanalPct);

    const receitaLiquida29 = st === null
        ? baseMargem29 - (baseMargem29 * (encargoCanalPct + icmsVenda))
        : baseMargem29 - (baseMargem29 * encargoCanalPct);

    const margemGzt15 = receitaLiquida15 > 0
        ? ((receitaLiquida15 - custoUnitarioBase) / receitaLiquida15) * 100
        : 0;

    const margemGzt29 = receitaLiquida29 > 0
        ? ((receitaLiquida29 - custoUnitarioBase) / receitaLiquida29) * 100
        : 0;

    const multipleGzt = fob ? precoVenda / fob : 0;
    const multipleGrz = fob ? precoGrazziotin / fob : 0;
    const fobCTNR = produtoFOBUSD;

    resultado.innerHTML = `
        <tr><td>Peças por container</td><td>${formatarInteiro(pecasContainer)}</td></tr>
        <tr>
            <td><strong>Custo unitário</strong></td>
            <td><strong>R$ ${formatarNumeroBR(custoUnitarioFinal, 2)}</strong></td>
        </tr>
        <tr><td>Preço venda</td><td>R$ ${formatarNumeroBR(precoVenda, 2)}</td></tr>
        <tr><td>Preço Venda Grazziotin -25%</td><td>R$ ${formatarNumeroBR(precoGrazziotin, 2)}</td></tr>
        <tr><td>Preço venda c/ IPI</td><td>R$ ${formatarNumeroBR(precoVendaIPI, 2)}</td></tr>
        <tr><td>Custo CTNR</td><td>USD ${formatarNumeroBR(fobCTNR, 2)}</td></tr>
        <tr><td>Margem -15%</td><td>${formatarNumeroBR(margemGzt15, 2)} %</td></tr>
        <tr><td>Margem -29%</td><td>${formatarNumeroBR(margemGzt29, 2)} %</td></tr>
        <tr><td>Multiple Mundiart</td><td>${formatarNumeroBR(multipleGzt, 1)}</td></tr>
        <tr><td>Multiple Grazziotin</td><td>${formatarNumeroBR(multipleGrz, 1)}</td></tr>
    `;

    window.ULTIMO_CALCULO = {
        fob,
        cbmCaixa,
        pecasCaixa,
        cbmContainer,
        pecasContainer,
        produtoFOBUSD,
        cifUSD,
        produtoFOBBRL,
        freteBRL,
        cifBRL,
        valorII,
        valorIPIImport,
        valorPIS,
        valorCOFINS,
        subtotalDespacho,
        valorICMSImport,
        custoTotal,
        custoTotalAjustado,
        valorUsadoCalculo,
        custoVendaCliente,
        precoVenda,
        precoVendaIPI,
        custoUnitarioFinal,
        margemGzt15,
        margemGzt29,
        multipleGzt,
        multipleGrz
    };
}

async function init() {
    await carregarParametros();
    preencherPortos();
    aplicarParametrosNaTela();

    const porto = document.getElementById("porto");
    if (porto) {
        porto.addEventListener("change", () => {
            aplicarFretePadraoDoPorto(false);
        });
    }
}

function abrirDetalhamento() {
    const d = window.ULTIMO_CALCULO;

    if (!d) {
        alert("Calcule primeiro.");
        return;
    }

    const html = `
        <h6 class="mb-3">Peças por container</h6>
        <p>
            Peças = (CBM container ÷ CBM caixa) × peças por caixa<br>
            Peças = (${formatarNumeroBR(d.cbmContainer, 2)} ÷ ${formatarNumeroBR(d.cbmCaixa, 4)}) × ${formatarNumeroBR(d.pecasCaixa, 0)}<br>
            <strong>= ${formatarInteiro(d.pecasContainer)}</strong>
        </p>

        <h6 class="mt-4 mb-3">Custo unitário</h6>
        <p>
            Custo unitário = custo total ÷ peças<br>
            Custo unitário = ${formatarNumeroBR(d.custoTotalAjustado, 2)} ÷ ${formatarInteiro(d.pecasContainer)}<br>
            <strong>= ${formatarNumeroBR(d.custoUnitarioFinal, 2)}</strong>
        </p>

        <h6 class="mt-4 mb-3">Preço venda</h6>
        <p>
            Preço = custo venda cliente ÷ peças<br>
            Preço = ${formatarNumeroBR(d.custoVendaCliente, 2)} ÷ ${formatarInteiro(d.pecasContainer)}<br>
            <strong>= ${formatarNumeroBR(d.precoVenda, 2)}</strong>
        </p>

        <h6 class="mt-4 mb-3">Preço Grazziotin (-25%)</h6>
        <p>
            Preço Grazziotin = preço × (1 - 25%)<br>
            Preço = ${formatarNumeroBR(d.precoVenda, 2)} × 0,75<br>
            <strong>= ${formatarNumeroBR(d.precoGrazziotin, 2)}</strong>
        </p>

        <h6 class="mt-4 mb-3">Preço venda com IPI</h6>
        <p>
            Preço com IPI = preço × (1 + IPI)<br>
            Preço = ${formatarNumeroBR(d.precoVenda, 2)} × (1 + ${formatarNumeroBR(d.ipi * 100, 2)}%)<br>
            <strong>= ${formatarNumeroBR(d.precoVendaIPI, 2)}</strong>
        </p>

        <h6 class="mt-4 mb-3">Custo CTNR</h6>
        <p>
            FOB CTNR = peças × custo USD<br>
            FOB = ${formatarInteiro(d.pecasContainer)} × ${formatarNumeroBR(d.fob, 2)}<br>
            <strong>= USD ${formatarNumeroBR(d.produtoFOBUSD, 2)}</strong>
        </p>

        <h6 class="mt-4 mb-3">Margem -15%</h6>
        <p>
            Margem = (receita - custo) ÷ receita<br>
            <strong>= ${formatarNumeroBR(d.margemGzt15, 2)}%</strong>
        </p>

        <h6 class="mt-4 mb-3">Margem -29%</h6>
        <p>
            Margem = (receita - custo) ÷ receita<br>
            <strong>= ${formatarNumeroBR(d.margemGzt29, 2)}%</strong>
        </p>

        <h6 class="mt-4 mb-3">Multiple Mundiart</h6>
        <p>
            Multiple = preço ÷ FOB unitário<br>
            Multiple = ${formatarNumeroBR(d.precoVenda, 2)} ÷ ${formatarNumeroBR(d.fob, 2)}<br>
            <strong>= ${formatarNumeroBR(d.multipleGzt, 2)}</strong>
        </p>

        <h6 class="mt-4 mb-3">Multiple Grazziotin</h6>
        <p>
            Multiple = preço Grazziotin ÷ FOB unitário<br>
            Multiple = ${formatarNumeroBR(d.precoGrazziotin, 2)} ÷ ${formatarNumeroBR(d.fob, 2)}<br>
            <strong>= ${formatarNumeroBR(d.multipleGrz, 2)}</strong>
        </p>
    `;

    document.getElementById("detalhamentoConteudo").innerHTML = html;

    new bootstrap.Modal(document.getElementById("modalDetalhamento")).show();
}

document.addEventListener("DOMContentLoaded", init);