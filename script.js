/* ========================================== */
/* 1. GLOBAL CONFIGURATION & VARIABLES        */
/* ========================================== */
const urlParams = new URLSearchParams(window.location.search);
const DEPT_CODE = urlParams.get('dept') || 'A';
const DEPARTMENT_PREFIX = DEPT_CODE + "-";

let currentLang = 'fr';
let fullCatalogData = [];
let deptCatalogData = [];
let cart = [];
let unitSelections = {}; // Unit control tracking
let currentImageSet = []; // Gallery images
let currentImageIndex = 0;
const CART_KEY = 'cotationCart';

// DEPARTMENT CONFIGURATION MAPPING
const DEPT_CONFIG = {
    'A': {
        title: "VENTE D'ÉQUIPEMENT ARPENTAGE",
        placeholder: "Rechercher (ex: TS16, Trépied...)",
        categories: [
            "Tous", "Station Totale", "GPS", "Accessoires", "Appareil de mesure",
            "Outils électriques", "Outils légers", "Quincailleries", "Monuments",
            "Véhicule Électrique", "Matériels de Sécurité", "Entrepôt Conteneur",
            "Véhicule", "Mesure Ferroviaire"
        ]
    },
    'I': {
        title: "VENTE INFORMATIQUE ET BUREAU",
        placeholder: "Rechercher (ex: Dell, Écran...)",
        categories: [
            "Tous", "Ordinateur", "Portables", "Écrans", "Périphériques",
            "Imprimante", "Photocopieurs", "Fournitures de bureau", "Fourniture",
            "Tableaux", "Électroménager"
        ]
    },
    'O': {
        title: "VENTE MATÉRIEL ET OUTILS",
        placeholder: "Rechercher (ex: Hilti, Perceuse...)",
        categories: [
            "Tous", "Outils électriques", "Outils légers", "Quincailleries",
            "Entrepôt Conteneur", "Matériels de Sécurité", "Clôture et signalisation","Materiels"
        ]
    },
    'M': {
        title: "VENTE MACHINERIE",
        placeholder: "Rechercher (ex: Générateur...)",
        categories: [
            "Tous", "Machinerie légère",
            "Générateurs électriques", "Véhicule"
        ]
    }
};

/* ========================================== */
/* 2. LOCALIZATION & TEXT RESOURCES           */
/* ========================================== */
const translations = {
    fr: {
        nav_home: "Accueil",
        nav_catalog: "Catalogue",
        nav_disclaimer: "Politique",
        nav_departments: "Départements",
        btn_add: "Ajouter à la Demande",
        btn_view: "Voir Détail",
        btn_unavailable: "Non Disponible",
        card_price_free: "Bientôt disponible",
        cart_title: "Votre Demande de Cotation",
        cart_empty: "Votre demande est vide.",
        cart_total: "Total Estimé",
        cart_table_lot: "Lot",
        cart_table_desc: "Description",
        cart_table_price: "Prix",
        modal_details_title: "Détails & Inclusions:",
        modal_manual_btn: "📄 Voir Fiche Technique (PDF)",
        form_note: "⚠️ Note importante : Les prix affichés n'incluent ni les taxes ni les frais de transport.",
        form_info: "ℹ️ Lots partiels : Si vous souhaitez acquérir uniquement un élément spécifique, indiquez-le.",
        categories: {
            "Tous": "Tous",
            "Station Totale": "Station Totale",
            "GPS": "GPS",
            "Accessoires": "Accessoires",
            "Appareil de mesure": "Appareil de mesure",
            "Outils électriques": "Outils électriques",
            "Outils légers": "Outils légers",
            "Quincailleries": "Quincailleries",
            "Monuments": "Monuments",
            "Véhicule Électrique": "Véhicule Électrique",
            "Matériels de Sécurité": "Matériels de Sécurité",
            "Entrepôt Conteneur": "Entrepôt Conteneur",
            "Véhicule": "Véhicule",
            "Mesure Ferroviaire": "Mesure Ferroviaire",
            "Ordinateur": "Ordinateur",
            "Portables": "Portables",
            "Écrans": "Écrans",
            "Périphériques": "Périphériques",
            "Imprimante": "Imprimante",
            "Photocopieurs": "Photocopieurs",
            "Fournitures de bureau": "Fournitures de bureau",
            "Fourniture": "Fourniture",
            "Tableaux": "Tableaux",
            "Électroménager": "Électroménager",
            "Machinerie légère": "Machinerie légère",
            "Machinerie lourde": "Machinerie lourde",
            "Générateurs électriques": "Générateurs électriques",
            "Clôture et signalisation": "Clôture et signalisation",
            "Materiels": "Materiels"
        },
        policy_html: `
            <h2>Politique de Vente</h2>
            <div class="disclaimer-box">
                <h3>1. Vente Finale</h3><p>Toutes les ventes sont finales.</p>
                <h3>2. État "Tel quel"</h3><p>Les articles sont vendus sans garantie.</p>
                <h3>3. Inspection</h3><p>Inspection sur place recommandée.</p>
            </div>`
    },
    en: {
        nav_home: "Home",
        nav_catalog: "Catalog",
        nav_disclaimer: "Policy",
        nav_departments: "Departments",
        btn_add: "Add to Quote",
        btn_view: "View Details",
        btn_unavailable: "Unavailable",
        card_price_free: "Coming Soon",
        cart_title: "Your Quote Request",
        cart_empty: "Your quote request is empty.",
        cart_total: "Estimated Total",
        cart_table_lot: "Lot",
        cart_table_desc: "Description",
        cart_table_price: "Price",
        modal_details_title: "Details & Inclusions:",
        modal_manual_btn: "📄 View Datasheet (PDF)",
        form_note: "⚠️ Important Note: Displayed prices do not include taxes or shipping costs.",
        form_info: "ℹ️ Partial Lots: If you wish to acquire only a specific item, please indicate it.",
        categories: {
            "Tous": "All",
            "Station Totale": "Total Station",
            "GPS": "GNSS / GPS",
            "Accessoires": "Accessories",
            "Appareil de mesure": "Measuring Devices",
            "Outils électriques": "Power Tools",
            "Outils légers": "Light Tools",
            "Quincailleries": "Hardware",
            "Monuments": "Monuments",
            "Véhicule Électrique": "Electric Vehicle",
            "Matériels de Sécurité": "Safety Equipment",
            "Entrepôt Conteneur": "Storage Container",
            "Véhicule": "Vehicle",
            "Mesure Ferroviaire": "Railway Measurement",
            "Ordinateur": "Computer",
            "Portables": "Laptops",
            "Écrans": "Monitors",
            "Périphériques": "Peripherals",
            "Imprimante": "Printers",
            "Photocopieurs": "Copiers",
            "Fournitures de bureau": "Office Supplies",
            "Fourniture": "Furniture",
            "Tableaux": "Whiteboards",
            "Électroménager": "Appliances",
            "Machinerie légère": "Light Machinery",
            "Machinerie lourde": "Heavy Machinery",
            "Générateurs électriques": "Generators",
            "Clôture et signalisation": "Fencing & Signage",
            "Materiels":"Materials",
        },
        policy_html: `
            <h2>Sales Policy</h2>
            <div class="disclaimer-box">
                <h3>1. Final Sale</h3><p>All sales are final.</p>
                <h3>2. "As Is" Condition</h3><p>Items sold without warranty.</p>
                <h3>3. Inspection</h3><p>On-site inspection recommended.</p>
            </div>`
    }
};

function getText(key) { return translations[currentLang][key] || key; }

/* ========================================== */
/* 3. INITIALIZATION & SETUP                  */
/* ========================================== */
document.addEventListener('DOMContentLoaded', () => {
    const config = DEPT_CONFIG[DEPT_CODE] || DEPT_CONFIG['A'];
    const titleEl = document.getElementById('dept-title-dynamic');
    if(titleEl) titleEl.textContent = config.title;
    const searchEl = document.getElementById('search-input');
    if(searchEl) searchEl.placeholder = config.placeholder;

    if (typeof emailjs !== 'undefined') emailjs.init("frfWoBbmJwoPNo-qm");

    loadCart();
    cargarCatalogo();

    const form = document.getElementById('order-form');
    if(form) form.addEventListener('submit', sendOrder);

    updateFormDisclaimer();
});

function updateFormDisclaimer() {
    const container = document.getElementById('form-disclaimer-container');
    if(container) {
        container.innerHTML = `
            <div class="form-disclaimer">${getText('form_note')}</div>
            <div class="form-info-box">${getText('form_info')}</div>
        `;
    }
}

function cargarCatalogo() {
    fetch('catalog.json')
        .then(response => response.json())
        .then(data => {
            fullCatalogData = data;
            deptCatalogData = fullCatalogData.filter(item =>
                item.lot && item.lot.toString().startsWith(DEPARTMENT_PREFIX)
            );
            generarFiltros(deptCatalogData);
            generarTarjetas(deptCatalogData);
        })
        .catch(err => {
            console.error(err);
            document.getElementById('catalogo-container').innerHTML = "<p>Erreur de chargement.</p>";
        });
}

/* ========================================== */
/* 4. FILTERS & CATEGORIES (ICON LOGIC)       */
/* ========================================== */
function cleanIconName(catName) {
    if(!catName) return "default";

    // EXACT MAPPING BASED ON FILE LIST (NO ACCENTS/SPACES)
    const map = {
        "Clôture et signalisation": "Clouture_et_signalitation",
        "Véhicule Électrique": "Vehicule_Electrique",
        "Station Totale": "Station_Totale",
        "Appareil de mesure": "Appareil_de_mesure",
        "Entrepôt Conteneur": "Entrepot_Conteneur",
        "Outils électriques": "Outils_electriques",
        "Outils légers": "Outils_legers",
        "Matériels de Sécurité": "Materiels_de_Securite",
        "Mesure Ferroviaire": "Mesure_Ferroviaire",
        "Fournitures de bureau": "Fournitures_de_bureau",
        "Machinerie légère": "Machinerie_legere",
        "Machinerie lourde": "Machinerie_lourde",
        "Générateurs électriques": "Generateurs_electriques",
        "Écrans": "Ecrans",
        "Électroménager": "Electromenager",
        "Périphériques": "Peripheriques",
        "Véhicule": "Vehicule",
        "Materiels":"Materiels",
    };

    if(map[catName]) return map[catName];

    // Fallback cleanup if map fails
    return catName.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                  .replace(/\s+/g, '_')
                  .replace(/[^a-zA-Z0-9_]/g, '');
}

function generarFiltros(data) {
    const container = document.getElementById('filter-container');
    if (!container) return;
    container.innerHTML = '';

    const config = DEPT_CONFIG[DEPT_CODE] || DEPT_CONFIG['A'];

    config.categories.forEach(cat => {
        const hasStock = cat === 'Tous' || data.some(item => item.categorie === cat);
        const iconName = cleanIconName(cat);

        const div = document.createElement('div');
        div.className = `category-button-wrapper ${cat === 'Tous' ? 'active' : ''} ${!hasStock ? 'disabled-filter' : ''}`;

        if (hasStock) {
            div.onclick = () => {
                document.querySelectorAll('.category-button-wrapper').forEach(b => b.classList.remove('active'));
                div.classList.add('active');
                const filtrados = cat === 'Tous' ? deptCatalogData : deptCatalogData.filter(i => i.categorie === cat);
                generarTarjetas(filtrados);
            };
        }

        div.innerHTML = `
            <img src="icons/${iconName}.jpg" class="category-icon-clickable"
                 style="${!hasStock ? 'filter: grayscale(1) opacity(0.4); cursor: default;' : ''}"
                 onerror="this.src='icons/default.jpg'">
            <span class="category-text-below" style="${!hasStock ? 'color: #ccc;' : ''}">
                ${translations[currentLang].categories[cat] || cat}
            </span>
        `;
        container.appendChild(div);
    });
}

/* ========================================== */
/* 5. CARDS & UNIT SALES LOGIC                */
/* ========================================== */
let searchTimeout;
function filtrarPorBusqueda() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const term = document.getElementById('search-input').value.toLowerCase();
        if (term === "") { generarTarjetas(deptCatalogData); return; }
        const filtered = deptCatalogData.filter(item =>
            (item.lot + " " + item.descripcion + " " + item.categorie).toLowerCase().includes(term)
        );
        generarTarjetas(filtered);
    }, 300);
}

function generarTarjetas(lotes) {
    const container = document.getElementById('catalogo-container');
    container.innerHTML = '';

    if (lotes.length === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%;">Aucun résultat trouvé.</p>';
        return;
    }

    // Render detailed design for each card
    const htmlTotal = lotes.map(lote => generarTarjetaHTML(lote)).join('');
    container.innerHTML = htmlTotal;
}

function generarTarjetaHTML(item) {
    if (unitSelections[item.lot] === undefined) unitSelections[item.lot] = 0;

    const iconName = cleanIconName(item.categorie);

    // --- 1. EMOJI BADGE LOGIC (Restored from stable version) ---
    let badgesHTML = '';
    if (DEPT_CODE === 'A' && item.detalles) {
        const det = item.detalles.toLowerCase();
        const tags = [
            {k:'trépied', l:'🔭 Trépied'}, {k:'canne', l:'📏 Canne'},
            {k:'cs20', l:'📱 CS20'}, {k:'chargeur', l:'🔋 Chargeur'},
            {k:'prisme', l:'💎 Prisme'}, {k:'radio', l:'📡 Radio'}
        ];
        tags.forEach(t => {
            if(det.includes(t.k)) badgesHTML += `<span class="tech-badge">${t.l}</span>`;
        });
    }

    // --- 2. PRICING LOGIC (Restored) ---
    const esGratis = item.prix === 0;
    const precioDisplay = esGratis
        ? `<span style="color:#d9534f; font-size:0.9em;">Bientôt disponible</span>`
        : new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(item.prix);

    // --- 3. UNIT LOGIC (Grey box restoration) ---
    const esDivisible = (item.units_available > 1 && item.unit_price > 0);
    let unitSelectorHTML = '';

    if (esDivisible) {
        const precioUnidad = new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(item.unit_price);
        unitSelectorHTML = `
            <div class="unit-controls" style="margin: 10px 0; padding: 10px; background: #f9f9f9; border: 1px solid #eee; border-radius: 5px; text-align:center;">
                <div style="font-size: 0.85em; margin-bottom: 5px; color:#07284f; font-weight:bold;">
                    Acheter à l'unité: ${precioUnidad} / un.
                </div>
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin: 5px 0;">
                    <button onclick="cambiarCantidad('${item.lot}', -1, ${item.units_available})" style="width:30px; height:30px; cursor:pointer;">-</button>
                    <span id="count-${item.lot}" style="font-weight:bold; font-size:1.1em;">${unitSelections[item.lot]}</span>
                    <button onclick="cambiarCantidad('${item.lot}', 1, ${item.units_available})" style="width:30px; height:30px; cursor:pointer;">+</button>
                </div>
                <div style="font-size:0.8em; color:#666;">Disponibles: ${item.units_available}</div>
            </div>`;
    }

    return `
    <div class="lote-card">
        <div class="category-corner-icon">
            <img src="icons/${iconName}.jpg" onerror="this.src='icons/default.jpg'">
        </div>

        <h3>Lot ${item.lot}</h3>
        <h4>${item.descripcion}</h4>

        <div class="badge-container">${badgesHTML}</div>

        <p style="font-size: 0.85em; color: #666; margin: 5px 0;">${item.categorie}</p>

        <strong style="color: #7FBC42; font-size: 1.4rem; display: block; margin: 10px 0;">${precioDisplay}</strong>

        ${unitSelectorHTML}

        <div class="card-actions" style="margin-top: auto;">
            <button onclick="verDetalle('${item.lot}')" class="btn-detail">Voir Détail</button>
            <button id="btn-add-${item.lot}" onclick="agregarAlCarritoInteligente('${item.lot}')" class="btn-add" ${esGratis?'disabled':''}>
                ${esGratis ? 'Non Disponible' : 'Ajouter'}
            </button>
        </div>
    </div>`;
}

function cambiarCantidad(lotId, cambio, max) {
    let actual = unitSelections[lotId] || 0;
    let nuevo = actual + cambio;
    if (nuevo < 0) nuevo = 0;
    if (nuevo > max) nuevo = max;
    unitSelections[lotId] = nuevo;
    document.getElementById(`count-${lotId}`).innerText = nuevo;
    actualizarBotonCompra(lotId);
}

function actualizarBotonCompra(lotId) {
    const item = deptCatalogData.find(i => i.lot === lotId);
    if (!item) return;
    const qty = unitSelections[lotId] || 0;
    const btn = document.getElementById(`btn-add-${lotId}`);

    if (qty === 0) {
        btn.innerText = getText('btn_add');
        btn.style.backgroundColor = "";
    } else {
        const total = qty * item.unit_price;
        btn.innerHTML = `Ajouter <b>${qty}</b> unités - ${total.toFixed(2)}$`;
        btn.style.backgroundColor = "#7FBC42";
    }
}

function agregarAlCarritoInteligente(lotId) {
    const item = deptCatalogData.find(i => i.lot === lotId);
    const qty = unitSelections[lotId] || 0;

    if (qty === 0) {
        anadirAlCarrito(item.lot, item.descripcion, item.prix);
    } else {
        anadirAlCarrito(item.lot, `${item.descripcion} (x${qty})`, item.unit_price * qty);
        cambiarCantidad(lotId, -qty, item.units_available); // Reset
    }
}

/* ========================================== */
/* 6. MODAL DETAILS & GALLERY                 */
/* ========================================== */
function verDetalle(lotID) {
    const lote = deptCatalogData.find(i => i.lot === lotID);
    if (!lote) return;

    currentImageSet = lote.imagenes && lote.imagenes.length > 0 ? lote.imagenes : ['default.jpg'];
    currentImageIndex = 0;

    const manualBtn = lote.manual_url ? `<a href="${lote.manual_url}" target="_blank" class="manual-btn-styled">${getText('modal_manual_btn')}</a>` : '';
    const precio = lote.prix === 0 ? getText('btn_unavailable') : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'CAD' }).format(lote.prix);

    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div class="modal-flex-container">
            <div class="modal-col-left">
                ${currentImageSet.length > 1 ? '<span class="gallery-arrow left-arrow" onclick="imagenAnterior()">&#10094;</span>' : ''}
                <img id="modal-product-image" src="img/${currentImageSet[0]}" onerror="this.src='img/default.jpg'">
                ${currentImageSet.length > 1 ? '<span class="gallery-arrow right-arrow" onclick="imagenSiguiente()">&#10095;</span>' : ''}
            </div>
            <div class="modal-col-right">
                <h2>Lot ${lote.lot}</h2>
                <h3>${lote.descripcion}</h3>
                <div class="details-box-styled">
                    <h4>${getText('modal_details_title')}</h4>
                    <p>${lote.detalles || ''}</p>
                </div>
                ${manualBtn}
                <div class="price-big-display">${precio}</div>
                <button class="add-cart-btn-styled" onclick="anadirAlCarrito('${lote.lot}', '${lote.descripcion.replace(/'/g, "\\'")}', ${lote.prix}); cerrarModal();" ${lote.prix===0?'disabled':''}>
                    ${getText('btn_add')}
                </button>
            </div>
        </div>`;
    document.getElementById('modal-detalle').style.display = 'block';
}

function updateImage() {
    const img = document.getElementById('modal-product-image');
    if(img) img.src = `img/${currentImageSet[currentImageIndex]}`;
}
function imagenAnterior() {
    if(currentImageSet.length > 1) {
        currentImageIndex = (currentImageIndex - 1 + currentImageSet.length) % currentImageSet.length;
        updateImage();
    }
}
function imagenSiguiente() {
    if(currentImageSet.length > 1) {
        currentImageIndex = (currentImageIndex + 1) % currentImageSet.length;
        updateImage();
    }
}

/* ========================================== */
/* 7. CART & NAVIGATION                       */
/* ========================================== */
function loadCart() {
    const stored = localStorage.getItem(CART_KEY);
    if (stored) cart = JSON.parse(stored);
    updateCartUI();
}
function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartUI(); }
function updateCartUI() {
    document.getElementById('cart-count').textContent = cart.length;
    document.getElementById('floating-cart-button').style.display = cart.length > 0 ? 'flex' : 'none';
}
function anadirAlCarrito(lot, desc, prix) {
    cart.push({lote: lot, descripcion: desc, prix: prix});
    saveCart();
    // Visual effect
    const btn = document.getElementById('floating-cart-button');
    btn.style.transform = "scale(1.2)"; setTimeout(() => btn.style.transform = "scale(1)", 200);
}

function showCotationModal() {
    document.getElementById('cart-modal').style.display = 'block';
    const div = document.getElementById('cart-summary');
    if(cart.length===0) { div.innerHTML = `<p>${getText('cart_empty')}</p>`; return; }

    let total = 0;
    let html = `<table style="width:100%; border-collapse:collapse;"><thead><tr style="background:#eee;"><th>${getText('cart_table_lot')}</th><th>${getText('cart_table_desc')}</th><th>${getText('cart_table_price')}</th><th></th></tr></thead><tbody>`;
    cart.forEach((i, idx) => {
        total += i.prix;
        html += `<tr>
            <td style="padding:10px; border-bottom:1px solid #ddd;">${i.lote}</td>
            <td style="padding:10px; border-bottom:1px solid #ddd;">${i.descripcion}</td>
            <td style="padding:10px; border-bottom:1px solid #ddd;">${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'CAD' }).format(i.prix)}</td>
            <td style="padding:10px; border-bottom:1px solid #ddd;"><button onclick="removeItem(${idx})" style="background:red; color:white; border:none; border-radius:3px; cursor:pointer;">X</button></td>
        </tr>`;
    });
    html += `</tbody></table><h3 style="text-align:right;">${getText('cart_total')}: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'CAD' }).format(total)}</h3>`;
    div.innerHTML = html;
}

function removeItem(idx) {
    cart.splice(idx, 1); saveCart(); showCotationModal();
    if(cart.length===0) closeCartModal();
}

function mostrarSeccion(id) {
    if(id === 'disclaimer') {
        document.getElementById('section-catalogo').classList.add('hidden');
        document.getElementById('section-disclaimer').classList.remove('hidden');
        document.getElementById('policy-content').innerHTML = translations[currentLang].policy_html;
    }
}
function cerrarModal() { document.getElementById('modal-detalle').style.display = 'none'; }
function closeCartModal() { document.getElementById('cart-modal').style.display = 'none'; }

function toggleLanguage() {
    currentLang = currentLang === 'fr' ? 'en' : 'fr';
    document.getElementById('lang-toggle').textContent = currentLang === 'fr' ? 'EN' : 'FR';
    generarFiltros(deptCatalogData);
    generarTarjetas(deptCatalogData);
    updateFormDisclaimer();
}

// Email sending logic
function sendOrder(e) {
    e.preventDefault();
    if (cart.length === 0) return alert("Panier vide");
    const form = document.getElementById('order-form');
    const params = {
        client_name: form.client_name.value,
        client_email: form.client_email.value,
        client_phone: form.client_phone.value,
        client_company: form.client_company.value,
        client_message: form.client_message.value,
        order_table_rows: cart.map(i => `${i.lote} - ${i.descripcion} - ${i.prix}$`).join('\n'),
        total_price: cart.reduce((sum, i) => sum + i.prix, 0).toFixed(2) + " $"
    };

    const btn = document.getElementById('submit-order');
    btn.textContent = "Envoi en cours...";
    btn.disabled = true;

    emailjs.send("service_qit85uu", "template_5l7jajt", params)
        .then(() => {
            document.getElementById('cotation-page').innerHTML = '<div style="text-align:center; padding:50px; color:green;"><h2>✅ Envoyé avec succès!</h2><p>Nous vous contacterons bientôt.</p></div>';
            cart = []; saveCart(); updateCartUI();
            setTimeout(() => window.location.reload(), 4000);
        })
        .catch(err => {
            alert("Erreur: " + JSON.stringify(err));
            btn.textContent = "Réessayer";
            btn.disabled = false;
        });
}