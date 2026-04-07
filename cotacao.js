let PARAMS = {};

function valorNumero(id, padrao = 0) {
    const el = document.getElementById(id);
    if (!el) return padrao;
    const txt = String(el.value ?? "").trim().replace(",", ".");
    const num = parseFloat(txt);
    return Number.isFinite(num) ? num : padrao;
}

function formatarNumeroBR(valor, casas = 2) {
    if (valor === null || valor === undefined || isNaN(valor)) return "";
    return Number(valor).toLocaleString("pt-BR", {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas
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

async function carregarParametros() {
    try {
        const local = localStorage.getItem("parametros");

        if (local) {
            PARAMS = JSON.parse(local);
        } else {
            const res = await fetch("parametros.json");
            PARAMS = await res.json();
        }

        if (!PARAMS.defaults) {
            const res = await fetch("parametros.json");
            const original = await res.json();
            PARAMS.defaults = original.defaults;
        }

    } catch (e) {
        PARAMS = {};
    }
}

function aplicarParametrosNaTela() {
    if (!PARAMS.defaults) return;

    document.getElementById("ii").value = PARAMS.defaults.ii ?? 0;
    document.getElementById("ipi").value = PARAMS.defaults.ipi ?? 0;
    document.getElementById("agente").value = PARAMS.defaults.agente ?? 0;
    document.getElementById("margem").value = PARAMS.defaults.margem ?? 0;

    document.getElementById("usdDespacho").value = PARAMS.defaults.usdDespacho ?? 0;
    document.getElementById("usd30").value = PARAMS.defaults.usd30 ?? 0;
    document.getElementById("usd70").value = PARAMS.defaults.usd70 ?? 0;
}

function abrirParametros() {
    document.getElementById("p_pis").value = PARAMS.pis ?? 0;
    document.getElementById("p_cofins").value = PARAMS.cofins ?? 0;
    document.getElementById("p_icmsImportacao").value = PARAMS.icmsImportacao ?? 0;
    document.getElementById("p_icmsVenda").value = PARAMS.icmsVenda ?? 0;
    document.getElementById("p_cpmf").value = PARAMS.cpmf ?? 0;

    document.getElementById("p_armazenagemPct").value = PARAMS.armazenagemPct ?? 0;
    document.getElementById("p_desembaraco").value = PARAMS.desembaraco ?? 0;
    document.getElementById("p_afrmmPct").value = PARAMS.afrmmPct ?? 0;
    document.getElementById("p_transporteInterno").value = PARAMS.transporteInterno ?? 0;

    document.getElementById("p_thcBL").value = PARAMS.thcBL ?? 0;
    document.getElementById("p_desova").value = PARAMS.desova ?? 0;
    document.getElementById("p_desconsolidacao").value = PARAMS.desconsolidacao ?? 0;
    document.getElementById("p_emissaoDI").value = PARAMS.emissaoDI ?? 0;
    document.getElementById("p_tagsEtiquetas").value = PARAMS.tagsEtiquetas ?? 0;

    new bootstrap.Modal(document.getElementById("modalParametros")).show();
}

function salvarParametros() {

    const defaults = PARAMS.defaults || {};

    PARAMS = {
        ...PARAMS,
        defaults
    };

    PARAMS.pis = parseFloat(document.getElementById("p_pis").value) || 0;
    PARAMS.cofins = parseFloat(document.getElementById("p_cofins").value) || 0;
    PARAMS.icmsImportacao = parseFloat(document.getElementById("p_icmsImportacao").value) || 0;
    PARAMS.icmsVenda = parseFloat(document.getElementById("p_icmsVenda").value) || 0;
    PARAMS.cpmf = parseFloat(document.getElementById("p_cpmf").value) || 0;

    PARAMS.armazenagemPct = parseFloat(document.getElementById("p_armazenagemPct").value) || 0;
    PARAMS.desembaraco = parseFloat(document.getElementById("p_desembaraco").value) || 0;
    PARAMS.afrmmPct = parseFloat(document.getElementById("p_afrmmPct").value) || 0;
    PARAMS.transporteInterno = parseFloat(document.getElementById("p_transporteInterno").value) || 0;

    PARAMS.thcBL = parseFloat(document.getElementById("p_thcBL").value) || 0;
    PARAMS.desova = parseFloat(document.getElementById("p_desova").value) || 0;
    PARAMS.desconsolidacao = parseFloat(document.getElementById("p_desconsolidacao").value) || 0;
    PARAMS.emissaoDI = parseFloat(document.getElementById("p_emissaoDI").value) || 0;
    PARAMS.tagsEtiquetas = parseFloat(document.getElementById("p_tagsEtiquetas").value) || 0;

    localStorage.setItem("parametros", JSON.stringify(PARAMS));
}

function calcular() {
    const resultado = document.getElementById("resultado");
    if (!resultado) return;

    const fob = valorNumero("fob");
    const cbmCaixa = valorNumero("cbmCaixa");
    const pecasCaixa = valorNumero("pecasCaixa");
    const usdFrete = valorNumero("frete");

    const ii = valorNumero("ii") / 100;
    const ipi = valorNumero("ipi") / 100;
    const agente = valorNumero("agente") / 100;
    const margem = valorNumero("margem") / 100;

    const usdDespacho = valorNumero("usdDespacho", 6.10);
    const usd30 = valorNumero("usd30", usdDespacho);
    const usd70 = valorNumero("usd70", usdDespacho);

    const st = lerPercentual("st");

    const porto = document.getElementById("porto");
    const portoSel = porto?.options[porto.selectedIndex];
    const cbmContainer = parseFloat(portoSel?.dataset?.cbm || "0");

    if (!fob || !cbmCaixa || !pecasCaixa || !cbmContainer) {
        resultado.innerHTML = `<tr><td colspan="2" class="text-danger text-center">Preencha FOB, CBM caixa, peças por caixa e porto.</td></tr>`;
        return;
    }

    const pis = PARAMS.pis ?? 0;
    const cofins = PARAMS.cofins ?? 0;
    const icmsImportacao = PARAMS.icmsImportacao ?? 0;
    const icmsVenda = PARAMS.icmsVenda ?? 0;
    const cpmf = PARAMS.cpmf ?? 0;

    const armazenagemPct = PARAMS.armazenagemPct ?? 0;
    const desembaraco = PARAMS.desembaraco ?? 0;
    const adicionalCofinsPct = PARAMS.adicionalCofinsPct ?? 0;
    const thcBL = PARAMS.thcBL ?? 0;
    const desova = PARAMS.desova ?? 0;
    const desconsolidacao = PARAMS.desconsolidacao ?? 0;
    const afrmmPct = PARAMS.afrmmPct ?? 0;
    const emissaoDI = PARAMS.emissaoDI ?? 0;
    const transporteInterno = PARAMS.transporteInterno ?? 0;
    const tagsEtiquetas = PARAMS.tagsEtiquetas ?? 0;

    const pagamento = "DP";
    const taxaFrete = usdDespacho * 1.10;

    const quantidadeCaixas = cbmContainer / cbmCaixa;
    const pecasContainer = quantidadeCaixas * pecasCaixa;

    const produtoFOBUSD = pecasContainer * fob;
    const freteInternacionalUSD = usdFrete;
    const seguroInternacionalUSD = 0;
    const cifUSD = produtoFOBUSD + freteInternacionalUSD + seguroInternacionalUSD;

    const produtoFOBBRL = (produtoFOBUSD * 0.30 * usd30) + (produtoFOBUSD * 0.70 * usd70);
    const freteInternacionalBRL = freteInternacionalUSD * taxaFrete;
    const seguroInternacionalBRL = seguroInternacionalUSD * taxaFrete;
    const cifBRL = produtoFOBBRL + freteInternacionalBRL + seguroInternacionalBRL;

    const valorII = cifBRL * ii;
    const valorIPIImport = (cifBRL + valorII) * ipi;

    const basePisCofins =
        cifBRL * (1 + (icmsImportacao * (ii + ipi * (1 + ii)))) /
        ((1 - pis - cofins) * (1 - icmsImportacao));

    const valorPIS = pis * basePisCofins;
    const valorCOFINS = cofins * basePisCofins;

    const fechamentoCambio = pagamento === "CC" ? 0 : 250;
    const cartaCredito = pagamento === "DP" ? 0 : (300 * usdDespacho);

    const valorArmazenagem = armazenagemPct * cifBRL;
    const valorAdicionalCofins = adicionalCofinsPct * basePisCofins;
    const valorAFRMM = afrmmPct * freteInternacionalBRL;

    const subtotalDespacho =
        valorArmazenagem +
        desembaraco +
        valorAdicionalCofins +
        thcBL +
        desova +
        desconsolidacao +
        valorAFRMM +
        emissaoDI;

    const valorICMSImport =
        ((cifBRL + valorII + valorIPIImport + valorPIS + valorCOFINS + subtotalDespacho) / 0.7375) *
        icmsImportacao;

    const subtotalDestino =
        valorII +
        valorIPIImport +
        valorPIS +
        valorCOFINS +
        fechamentoCambio +
        cartaCredito +
        subtotalDespacho +
        valorICMSImport +
        transporteInterno +
        tagsEtiquetas;

    const custoTotal = cifBRL + subtotalDestino;

    let valorUsadoCalculo;
    let icmsVendaFormula;

    if (st === null) {
        valorUsadoCalculo = custoTotal - valorICMSImport - valorIPIImport - valorPIS - valorCOFINS;
        icmsVendaFormula = icmsVenda;
    } else {
        const baseCalculoST = custoTotal * (1 + st);
        const icmsRecolherST = baseCalculoST * 0.17;
        valorUsadoCalculo = custoTotal + icmsRecolherST - valorICMSImport - valorCOFINS - valorPIS - valorIPIImport;
        icmsVendaFormula = 0;
    }

    const coeficiente = (100 - ((icmsVendaFormula + cofins + pis + cpmf + margem) * 100)) / 100;
    const custoVendaCliente = valorUsadoCalculo / coeficiente;

    const precoVenda = custoVendaCliente / pecasContainer;
    const custoUnitario = valorUsadoCalculo / pecasContainer;

    resultado.innerHTML = `
        <tr><td>Peças por container</td><td>${formatarNumeroBR(pecasContainer, 0)}</td></tr>
        <tr><td>Preço venda</td><td>${formatarNumeroBR(precoVenda, 2)}</td></tr>
        <tr><td>Custo unitário</td><td>${formatarNumeroBR(custoUnitario, 2)}</td></tr>
    `;
}

async function init() {
    await carregarParametros();
    aplicarParametrosNaTela();
}

document.addEventListener("DOMContentLoaded", init);