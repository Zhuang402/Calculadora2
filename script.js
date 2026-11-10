const $ = (id) => document.getElementById(id);
const NOTA_MINIMA = 3.0;

/* ---------- TEMA CLARO / OSCURO ---------- */
function cambiarTema() {
    document.body.classList.toggle("oscuro");
    const oscuro = document.body.classList.contains("oscuro");
    $("btnTema").textContent = oscuro ? "☀️" : "🌙";
    try {
        localStorage.setItem("tema", oscuro ? "oscuro" : "claro");
    } catch (e) { }
}

try {
    if (localStorage.getItem("tema") === "oscuro") {
        document.body.classList.add("oscuro");
        $("btnTema").textContent = "☀️";
    }
} catch (e) { }

/* ---------- FUNCIONES DE APOYO ---------- */
function notaValida(n) {
    return !isNaN(n) && n >= 0 && n <= 5;
}

function clasificarNota(nota) {
    // ESTRUCTURA CONDICIONAL
    if (nota < NOTA_MINIMA) {
        return { texto: "Reprobado", clase: "reprobado", color: "#ef4444" };
    } else if (nota < 4.0) {
        return { texto: "Aprobado", clase: "aprobado", color: "#f59e0b" };
    } else if (nota <= 4.5) {
        return { texto: "Notable", clase: "notable", color: "#22c55e" };
    } else {
        return { texto: "Excelente", clase: "excelente", color: "#3b82f6" };
    }
}

/* ---------- 1 y 2. SECUENCIAL + CONDICIONAL ---------- */
function calcular() {
    const msg = $("msgNota");
    const nombre = $("nombre").value.trim() || "El estudiante";

    // Paso 1: leer datos
    const n1 = parseFloat($("n1").value);
    const n2 = parseFloat($("n2").value);
    const n3Texto = $("n3").value.trim();
    const n3 = parseFloat(n3Texto);
    const p1 = parseFloat($("p1").value);
    const p2 = parseFloat($("p2").value);
    const p3 = parseFloat($("p3").value);

    // Validaciones
    if (!notaValida(n1) || !notaValida(n2)) {
        msg.textContent = "Las notas del corte 1 y 2 deben estar entre 0 y 5.";
        return;
    }
    if (n3Texto !== "" && !notaValida(n3)) {
        msg.textContent = "La nota del corte 3 debe estar entre 0 y 5.";
        return;
    }
    if (isNaN(p1) || isNaN(p2) || isNaN(p3) || p1 + p2 + p3 !== 100) {
        msg.textContent = "Los porcentajes deben sumar exactamente 100%.";
        return;
    }
    msg.textContent = "";

    $("resultadoNota").classList.remove("oculto");
    const mensaje = $("mensajeNota");

    // Caso A: falta el corte 3 -> calcular cuánto necesita
    if (n3Texto === "") {
        const acumulado = (n1 * p1 + n2 * p2) / 100;
        const necesaria = (NOTA_MINIMA - acumulado) / (p3 / 100);

        $("notaFinal").textContent = acumulado.toFixed(2);
        $("estadoNota").textContent = "Parcial";
        $("estadoNota").className = "estado";
        $("barraNota").style.width = (acumulado / 5) * 100 + "%";
        $("barraNota").style.background = "#888";

        if (necesaria <= 0) {
            mensaje.textContent = `✅ ${nombre} ya aprobó, aunque saque 0 en el corte 3.`;
        } else if (necesaria > 5) {
            mensaje.textContent = `❌ ${nombre} necesitaría ${necesaria.toFixed(2)} en el corte 3, y el máximo es 5.0. Ya no alcanza para aprobar.`;
        } else {
            mensaje.textContent = `📌 ${nombre} necesita al menos ${necesaria.toFixed(2)} en el corte 3 para aprobar.`;
        }
        return;
    }

    // Caso B: están los 3 cortes
    // Paso 2: calcular (secuencial)
    const notaFinal = (n1 * p1 + n2 * p2 + n3 * p3) / 100;

    // Paso 3: clasificar (condicional)
    const resultado = clasificarNota(notaFinal);

    // Paso 4: mostrar
    $("notaFinal").textContent = notaFinal.toFixed(2);
    $("estadoNota").textContent = resultado.texto;
    $("estadoNota").className = "estado " + resultado.clase;
    $("barraNota").style.width = (notaFinal / 5) * 100 + "%";
    $("barraNota").style.background = resultado.color;

    if (notaFinal >= NOTA_MINIMA) {
        mensaje.textContent = `🎉 ${nombre} aprobó con ${notaFinal.toFixed(2)}.`;
    } else {
        mensaje.textContent = `📚 ${nombre} reprobó con ${notaFinal.toFixed(2)}. Le faltaron ${(NOTA_MINIMA - notaFinal).toFixed(2)} puntos.`;
    }
}

/* ---------- 3. ITERATIVA: GRUPO ---------- */
let estudiantes = [];

function agregarEstudiante() {
    const nombre = $("gNombre").value.trim();
    const nota = parseFloat($("gNota").value);
    const msg = $("msgGrupo");

    if (nombre === "") {
        msg.textContent = "Escribe el nombre del estudiante.";
        return;
    }
    if (!notaValida(nota)) {
        msg.textContent = "La nota debe estar entre 0 y 5.";
        return;
    }
    if (estudiantes.length >= 30) {
        msg.textContent = "Máximo 30 estudiantes.";
        return;
    }
    msg.textContent = "";

    estudiantes.push({ nombre: nombre, nota: nota });
    $("gNombre").value = "";
    $("gNota").value = "";
    $("gNombre").focus();
    mostrarGrupo();
}

function eliminarEstudiante(indice) {
    estudiantes.splice(indice, 1);
    mostrarGrupo();
}

function cargarEjemplo() {
    estudiantes = [
        { nombre: "Ana", nota: 4.5 },
        { nombre: "Luis", nota: 2.8 },
        { nombre: "María", nota: 3.6 },
        { nombre: "Carlos", nota: 4.9 },
        { nombre: "Sofía", nota: 2.5 }
    ];
    $("msgGrupo").textContent = "";
    mostrarGrupo();
}

function limpiarGrupo() {
    estudiantes = [];
    $("msgGrupo").textContent = "";
    mostrarGrupo();
}

function mostrarGrupo() {
    const tabla = $("tablaGrupo");
    const stats = $("statsGrupo");

    tabla.innerHTML = "";
    stats.innerHTML = "";

    if (estudiantes.length === 0) return;

    // Encabezado
    const encabezado = tabla.insertRow();
    ["#", "Estudiante", "Nota", "Estado", ""].forEach((t) => {
        const th = document.createElement("th");
        th.textContent = t;
        encabezado.appendChild(th);
    });

    let suma = 0;
    let aprobados = 0;
    let maxima = estudiantes[0].nota;
    let minima = estudiantes[0].nota;

    // ESTRUCTURA ITERATIVA: recorre todos los estudiantes
    for (let i = 0; i < estudiantes.length; i++) {
        const est = estudiantes[i];
        const estado = clasificarNota(est.nota);

        suma += est.nota;
        if (est.nota >= NOTA_MINIMA) aprobados++;
        if (est.nota > maxima) maxima = est.nota;
        if (est.nota < minima) minima = est.nota;

        const fila = tabla.insertRow();
        fila.insertCell().textContent = i + 1;
        fila.insertCell().textContent = est.nombre;
        fila.insertCell().textContent = est.nota.toFixed(1);

        const celdaEstado = fila.insertCell();
        celdaEstado.textContent = estado.texto;
        celdaEstado.className = est.nota >= NOTA_MINIMA ? "ok" : "mal";

        const celdaBoton = fila.insertCell();
        const boton = document.createElement("button");
        boton.textContent = "✕";
        boton.setAttribute("aria-label", "Eliminar " + est.nombre);
        boton.onclick = function () { eliminarEstudiante(i); };
        celdaBoton.appendChild(boton);
    }

    const promedio = suma / estudiantes.length;
    const reprobados = estudiantes.length - aprobados;

    const datos = [
        ["Promedio", promedio.toFixed(2)],
        ["Más alta", maxima.toFixed(1)],
        ["Más baja", minima.toFixed(1)],
        ["Aprobados", aprobados],
        ["Reprobados", reprobados]
    ];

    for (let i = 0; i < datos.length; i++) {
        const caja = document.createElement("div");
        caja.className = "caja";
        const small = document.createElement("small");
        small.textContent = datos[i][0];
        const strong = document.createElement("strong");
        strong.textContent = datos[i][1];
        caja.appendChild(small);
        caja.appendChild(strong);
        stats.appendChild(caja);
    }
}

/* ---------- ENTER ejecuta el botón principal de su tarjeta ---------- */
document.querySelectorAll("input").forEach((input) => {
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            input.closest(".card").querySelector("button:not(.secundario)").click();
        }
    });
});