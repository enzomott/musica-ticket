let eventsData = [];
let countriesData = [];


// Inicialización principal: carga eventos y países al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    loadEvents(); // Carga los eventos desde eventos.json y llena el select de eventos
    loadCountries(); // Carga los países desde paises.json y llena el select de países
});


// Carga los eventos desde eventos.json y llena el select de eventos
function loadEvents() {
    fetch('eventos.json')
        .then(res => res.json())
        .then(data => {
            eventsData = data;
            const eventSelect = document.getElementById('event');
            data.forEach((event, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${event.evento} - ${event.artista} (${event.fecha})`;
                eventSelect.appendChild(option);
            });

            // Cuando el usuario selecciona un evento, se actualizan los campos de fecha y ubicación automáticamente
            eventSelect.addEventListener('change', function () {
                if (this.value !== '') {
                    const selectedEvent = eventsData[this.value];
                    document.getElementById('eventDate').value = `${selectedEvent.fecha} - ${selectedEvent.horario}`;
                    document.getElementById('eventLocation').value = `${selectedEvent.lugar}, ${selectedEvent.ciudad}`;
                } else {
                    document.getElementById('eventDate').value = '';
                    document.getElementById('eventLocation').value = '';
                }
            });
        });
}



// Carga los países desde paises.json y llena el select de países
function loadCountries() {
    fetch('paises.json')
        .then(res => res.json())
        .then(data => {
            countriesData = data;
            const countrySelect = document.getElementById('country');
            data.forEach(country => {
                const option = document.createElement('option');
                option.value = country.iso2;
                option.textContent = country.nameES;
                countrySelect.appendChild(option);
            });
        });
}




// Variables globales para el funcionamiento del formulario
let countdownTime = 600; // 10 minutos en segundos para el temporizador
let selectedEvent = null; // Evento seleccionado actualmente
let validationState = {
    fullName: false,
    email: false,
    phone: false,
    birthDate: false,
    country: false,
    event: false,
    ticketType: false,
    ticketQuantity: false,
    cardNumber: false,
    expiryDate: false,
    cvv: false,
    cardName: false
};

// Expresiones regulares
const regexPatterns = {
    fullName: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\d{10}$/,
    birthDate: /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
    ticketQuantity: /^[1-6]$/,
    cardNumber: /^\d{16}$/,
    expiryDate: /^(0[1-9]|1[0-2])\/\d{2}$/,
    cvv: /^\d{3,4}$/,
    cardName: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,}$/
};

// Inicialización
document.addEventListener('DOMContentLoaded', function () {
    initializeForm();
    startCountdown();
});

function initializeForm() {
    // Cargar eventos
    loadEvents();
    // Cargar países
    loadCountries();
    // Configurar validaciones
    setupValidations();
}



function setupValidations() {
    // Validación nombre completo
    document.getElementById('fullName').addEventListener('input', function () {
        validateField('fullName', this.value, regexPatterns.fullName, 'Debe contener solo letras y espacios, mínimo 3 caracteres');
    });

    // Validación email
    document.getElementById('email').addEventListener('input', function () {
        validateField('email', this.value, regexPatterns.email, 'Ingrese un email válido');
    });

    // Validación teléfono
    document.getElementById('phone').addEventListener('input', function () {
        // Permitir solo números
        this.value = this.value.replace(/\D/g, '');
        validateField('phone', this.value, regexPatterns.phone, 'Debe contener exactamente 10 dígitos');
    });
// validacion fecha de nacimiento
document.getElementById('birthDate').addEventListener('input', function () {
    let raw = this.value.replace(/\D/g, '');

    // Format the input
    if (raw.length > 8) {
        raw = raw.slice(0, 8);
    }
    if (raw.length >= 5) {
        this.value = raw.slice(0, 2) + '/' + raw.slice(2, 4) + '/' + raw.slice(4);
    } else if (raw.length >= 3) {
        this.value = raw.slice(0, 2) + '/' + raw.slice(2);
    } else {
        this.value = raw;
    }

    const val = this.value.trim();

    // Debugging line:
    console.log('Current input val:', val, 'length:', val.length);

    if (val.length === 10) {
        // First, check if it matches the general format regex
        if (regexPatterns.birthDate.test(val)) {
            // Then, check if it's a valid calendar date
            if (isValidDate(val)) {
                // Finally, check the age
                validateAge(val); // This function will call showSuccess or showError itself
            } else {
                showError('birthDate', 'Fecha inválida (ej. 31/02/1990).'); // More specific error for impossible dates
                validationState.birthDate = false;
            }
        } else {
            showError('birthDate', 'Formato incorrecto. Use dd/mm/yyyy.'); // If it doesn't match the dd/mm/yyyy pattern
            validationState.birthDate = false;
        }
    } else if (val.length === 0) {
        // If the field is empty
        showError('birthDate', 'La fecha de nacimiento es requerida.'); // Or simply clear error if you prefer
        validationState.birthDate = false;
    } else {
        // If length is less than 10 but not empty, it's incomplete
        showError('birthDate', 'Formato incompleto. Use dd/mm/yyyy');
        validationState.birthDate = false;
    }
    
    updateSubmitButton(); // Ensure this is always called to reflect the state
});


function isValidDate(dateStr) {
     const parts = dateStr.split('/');
    if (parts.length !== 3) return false;

    const [dd, mm, yyyy] = parts.map(Number); // Renamed yyy to yyyy

 // Validar rango lógico
    if (dd < 1 || dd > 31) return false;
    if (mm < 1 || mm > 12) return false;
    if (yyyy < 1900 || yyyy > new Date().getFullYear()) return false;

     const date = new Date(yyyy, mm - 1, dd);
    return (
    date.getFullYear() === yyyy &&
    date.getMonth() === mm - 1 &&
    date.getDate() === dd
);
}





    // Validación país
    document.getElementById('country').addEventListener('change', function () {
        validateField('country', this.value, /.+/, 'Debe seleccionar un país');
    });

    // Validación evento
    document.getElementById('event').addEventListener('change', function () {
        if (this.value !== '') {
            selectedEvent = eventsData[this.value];
            updateEventFields();
            validateField('event', this.value, /.+/, 'Debe seleccionar un evento');
            updateSummary();
        } else {
            selectedEvent = null;
            document.getElementById('eventDate').value = '';
            document.getElementById('eventLocation').value = '';
            showError('event', 'Debe seleccionar un evento');
        }
    });

    // Validación tipo de entrada
    document.getElementById('ticketType').addEventListener('change', function () {
        validateField('ticketType', this.value, /.+/, 'Debe seleccionar un tipo de entrada');
        updateSummary();
    });

    // Validación cantidad de entradas
    document.getElementById('ticketQuantity').addEventListener('input', function () {
        validateField('ticketQuantity', this.value, regexPatterns.ticketQuantity, 'Debe ser un número entre 1 y 6');
        updateSummary();
    });

    // Validación número de tarjeta
    document.getElementById('cardNumber').addEventListener('input', function () {
        // Permitir solo números
        let value = this.value.replace(/\D/g, '');

        // Formatear con espacios
        value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        this.value = value;

        // Validar y detectar tipo de tarjeta
        const cleanValue = value.replace(/\s/g, '');
        if (cleanValue.length === 16) {
            detectCardType(cleanValue);
            validateField('cardNumber', cleanValue, regexPatterns.cardNumber, 'Debe contener exactamente 16 dígitos');
        } else {
            document.getElementById('cardIcon').className = 'card-icon';
            showError('cardNumber', 'Debe contener exactamente 16 dígitos');
        }
    });

    // Validación fecha de vencimiento
    document.getElementById('expiryDate').addEventListener('input', function () {
        let value = this.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        this.value = value;

        if (regexPatterns.expiryDate.test(value)) {
            validateExpiryDate(value);
        } else {
            showError('expiryDate', 'Formato inválido. Use MM/AA');
        }
    });

    // Validación CVV
    document.getElementById('cvv').addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, '');
        validateField('cvv', this.value, regexPatterns.cvv, 'Debe contener 3 o 4 dígitos');
    });

    // Validación nombre en tarjeta
    document.getElementById('cardName').addEventListener('input', function () {
        validateField('cardName', this.value, regexPatterns.cardName, 'Debe contener solo letras y espacios, mínimo 3 caracteres');
    });
}

function validateField(fieldName, value, pattern, errorMessage) {
    const isValid = pattern.test(value);

    if (isValid) {
        showSuccess(fieldName);
        validationState[fieldName] = true;
    } else {
        showError(fieldName, errorMessage);
        validationState[fieldName] = false;
    }

    updateSubmitButton();
}

function validateAge(dateString) {
    const [day, month, year] = dateString.split('/').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear(); // CHANGE THIS TO LET
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    if (age >= 18) {
        showSuccess('birthDate');
        validationState.birthDate = true;
    } else {
        showError('birthDate', 'Debe ser mayor de 18 años');
        validationState.birthDate = false;
    }

    updateSubmitButton();
}

function validateExpiryDate(dateString) {
    const [month, year] = dateString.split('/').map(Number);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (year > currentYear || (year === currentYear && month >= currentMonth)) {
        showSuccess('expiryDate');
        validationState.expiryDate = true;
    } else {
        showError('expiryDate', 'La fecha debe estar en el futuro');
        validationState.expiryDate = false;
    }

    updateSubmitButton();
}

function detectCardType(cardNumber) {
    const cardIcon = document.getElementById('cardIcon');
    cardIcon.className = 'card-icon';

    if (cardNumber.startsWith('4')) {
        cardIcon.classList.add('card-visa');
    } else if (cardNumber.startsWith('5') || cardNumber.startsWith('2')) {
        cardIcon.classList.add('card-mastercard');
    } else if (cardNumber.startsWith('3')) {
        cardIcon.classList.add('card-amex');
    }
}

function updateEventFields() {
    if (selectedEvent) {
        document.getElementById('eventDate').value = `${selectedEvent.fecha} - ${selectedEvent.horario}`;
        document.getElementById('eventLocation').value = `${selectedEvent.lugar}, ${selectedEvent.ciudad}`;
    }
}

function updateSummary() {
    const eventSelect = document.getElementById('event');
    const ticketType = document.getElementById('ticketType').value;
    const quantity = document.getElementById('ticketQuantity').value;

    if (selectedEvent && ticketType && quantity) {
        document.getElementById('summaryBox').style.display = 'block';
        document.getElementById('summaryEvent').textContent = selectedEvent.evento;
        document.getElementById('summaryDate').textContent = `${selectedEvent.fecha} - ${selectedEvent.horario}`;
        document.getElementById('summaryLocation').textContent = `${selectedEvent.lugar}, ${selectedEvent.ciudad}`;
        document.getElementById('summaryTicketType').textContent = ticketType;
        document.getElementById('summaryQuantity').textContent = quantity;

        // Calcular precio
        let basePrice = selectedEvent.precio;
        let multiplier = 1;

        if (ticketType === 'VIP') {
            multiplier = 1.5;
        } else if (ticketType === 'Palco') {
            multiplier = 2;
        }

        const unitPrice = basePrice * multiplier;
        const totalPrice = unitPrice * parseInt(quantity);

        document.getElementById('summaryUnitPrice').textContent = `${unitPrice} ${selectedEvent.moneda}`;
        document.getElementById('summaryTotal').textContent = `${totalPrice} ${selectedEvent.moneda}`;
    } else {
        document.getElementById('summaryBox').style.display = 'none';
    }
}

function showError(fieldName, message) {
    const field = document.getElementById(fieldName);
    const errorElement = document.getElementById(fieldName + 'Error');
    const successElement = document.getElementById(fieldName + 'Success');

    field.parentElement.classList.remove('success');
    field.parentElement.classList.add('error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    successElement.style.display = 'none';
}

function showSuccess(fieldName) {
    const field = document.getElementById(fieldName);
    const errorElement = document.getElementById(fieldName + 'Error');
    const successElement = document.getElementById(fieldName + 'Success');

    field.parentElement.classList.remove('error');
    field.parentElement.classList.add('success');
    errorElement.style.display = 'none';
    successElement.style.display = 'block';
}

function updateSubmitButton() {
    const submitBtn = document.getElementById('submitBtn');
    const submitMessage = document.getElementById('submitMessage');

    const allValid = Object.values(validationState).every(state => state === true);

    if (allValid) {
        submitBtn.disabled = false;
        submitMessage.style.display = 'none';
    } else {
        submitBtn.disabled = true;
        submitMessage.style.display = 'block';

        // Mostrar qué campos faltan
        const missingFields = [];
        for (const [field, valid] of Object.entries(validationState)) {
            if (!valid) {
                missingFields.push(getFieldDisplayName(field));
            }
        }

        if (missingFields.length > 0) {
            submitMessage.textContent = `Complete correctamente: ${missingFields.join(', ')}`;
        }
    }
}

function getFieldDisplayName(fieldName) {
    const displayNames = {
        fullName: 'Nombre completo',
        email: 'Correo electrónico',
        phone: 'Teléfono',
        birthDate: 'Fecha de nacimiento',
        country: 'País',
        event: 'Evento',
        ticketType: 'Tipo de entrada',
        ticketQuantity: 'Cantidad',
        cardNumber: 'Número de tarjeta',
        expiryDate: 'Fecha de vencimiento',
        cvv: 'CVV',
        cardName: 'Nombre en tarjeta'
    };
    return displayNames[fieldName] || fieldName;
}

function startCountdown() {
    const countdownElement = document.getElementById('countdown');

    const timer = setInterval(() => {
        const minutes = Math.floor(countdownTime / 60);
        const seconds = countdownTime % 60;

        countdownElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (countdownTime <= 0) {
            clearInterval(timer);
            countdownElement.textContent = '00:00';
            countdownElement.style.color = '#e74c3c';
            alert('¡Tiempo agotado! Por favor, reinicie el proceso de compra.');
            document.getElementById('submitBtn').disabled = true;
            document.getElementById('submitMessage').textContent = 'Tiempo agotado para completar la compra';
            document.getElementById('submitMessage').style.display = 'block';
        }

        // Cambiar color cuando quedan menos de 2 minutos
        if (countdownTime <= 120) {
            countdownElement.style.color = '#e74c3c';
        } else if (countdownTime <= 300) {
            countdownElement.style.color = '#f39c12';
        }

        countdownTime--;
    }, 1000);
}

// Manejar envío del formulario
document.getElementById('ticketForm').addEventListener('submit', function (e) {
    e.preventDefault();

    if (Object.values(validationState).every(state => state === true)) {
        // Simular procesamiento
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.textContent;

        submitBtn.textContent = 'Procesando...';
        submitBtn.disabled = true;

        setTimeout(() => {
            alert('¡Compra realizada exitosamente! Recibirá un email con los detalles de su compra.');
            // Aquí normalmente se enviarían los datos al servidor
            submitBtn.textContent = originalText;
        }, 2000);
    }
});
