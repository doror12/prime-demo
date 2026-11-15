(() => {
  const find = (selector) => document.querySelector(selector);
  const zone = find('#booking-zone');
  const date = find('#booking-date');
  const time = find('#booking-time');
  const duration = find('#booking-duration');
  const seats = find('#booking-seat');
  const note = find('#map-note');
  const message = find('#booking-message');
  const zoneInfo = {
    standard: {
      name: 'Standard', count: 17,
      pc: '17 ПК · монитор 27″, 240 Гц, Full HD · Core i5-12400F · RTX 3060 · 16 ГБ ОЗУ · SSD 2 ТБ.',
      devices: 'Гарнитура Bloody · мышь Logitech G102 · клавиатура Red Square · кресло Knight Outrider.',
      price: '1 час: 120 ₽ в будни / 140 ₽ в выходные.',
    },
    ostrovok: {
      name: 'Островок', count: 0,
      pc: 'Количество мест и характеристики ПК уточняются.',
      devices: 'Гарнитура и другие устройства уточняются.',
      price: '1 час: 110 ₽ в будни / 130 ₽ в выходные.',
    },
    vip: {
      name: 'VIP', count: 5,
      pc: '5 ПК · монитор 27″, 320 Гц, 2K · Core i5-12400F · RTX 4060 Ti.',
      devices: 'Гарнитура и другие устройства уточняются.',
      price: '1 час: 140 ₽ в будни / 160 ₽ в выходные.',
    },
    simracing: {
      name: 'Simracing', count: 0, heading: 'Оборудование',
      pc: 'Зона гоночного симулятора. Количество мест и оборудование уточняются.',
      devices: 'Гарнитура и другие устройства уточняются.',
      price: '1 час: 500 ₽ в будни / 600 ₽ в выходные.',
    },
    'tv-zone': {
      name: 'TV Zone', count: 0, heading: 'Оборудование',
      pc: 'Игра на большом экране с PlayStation 5. Количество мест уточняется.',
      devices: 'Гарнитура и другие устройства уточняются.',
      price: '1 час: 300 ₽ в будни / 350 ₽ в выходные.',
    },
  };
  const offerLabels = {
    '1h': ['1 час', '1'], '2h': ['2 часа', '2'],
    '3h': ['3 часа', '3'], '5h': ['5 часов', '5'],
    morning: ['Утро · 08:00–12:00', ''],
    day: ['День · 12:00–22:00', ''],
    night: ['Ночь · 22:00–08:00', ''],
  };
  const query = new URLSearchParams(location.search);
  if (Object.hasOwn(zoneInfo, query.get('zone'))) zone.value = query.get('zone');
  const chosenOffer = offerLabels[query.get('offer')];
  const day = query.get('day') === 'weekend' ? 'выходные' : 'будни';
  let offer = chosenOffer ? `${chosenOffer[0]} · ${day}` : '';
  if (chosenOffer) duration.value = chosenOffer[1];
  date.min = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
  date.value = date.min;

  function render() {
    const info = zoneInfo[zone.value];
    find('#zone-description-title').textContent = `Зона ${info.name}`;
    find('#zone-pc-heading').textContent = info.heading || 'Характеристики ПК';
    find('#zone-pc-specs').textContent = info.pc;
    find('#zone-peripherals').textContent = info.devices;
    find('#zone-hourly-price').textContent = info.price;
    find('#summary-zone').textContent = info.name;
    find('#summary-offer').textContent = offer || duration.selectedOptions[0]?.textContent || 'Не выбран';
    find('#summary-date').textContent = date.value ? date.value.split('-').reverse().join('.') : '—';
    find('#summary-time').textContent = time.value || '—';
    find('#summary-duration').textContent = chosenOffer && offer && !duration.value
      ? chosenOffer[0] : duration.selectedOptions[0]?.textContent || '—';
    find('#summary-seat').textContent = seats.value ? `ПК ${seats.value.padStart(2, '0')}` : 'Не выбрано';
  }

  function updateSeats() {
    const info = zoneInfo[zone.value];
    seats.replaceChildren(new Option(info.count ? 'Выберите ПК' : 'Количество мест уточняется', ''));
    for (let number = 1; number <= info.count; number += 1) {
      seats.add(new Option(`ПК ${String(number).padStart(2, '0')}`, String(number)));
    }
    seats.disabled = !info.count;
    note.hidden = !info.count;
    note.textContent = info.count
      ? 'Номера показаны для примера. Реальная занятость не отображается.'
      : '';
    render();
  }

  zone.addEventListener('change', () => { offer = ''; updateSeats(); });
  duration.addEventListener('change', () => { offer = ''; render(); });
  [date, time, seats].forEach((field) => field.addEventListener('change', render));
  find('#confirm-booking').addEventListener('click', () => {
    message.textContent = 'Это пример: бронь не создана и оплата не списана.';
  });
  updateSeats();
})();
