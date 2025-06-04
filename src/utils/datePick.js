// src/utils/dateUtils.js

// export function formatDateToMMDDYYYY(dateStr) {
//   if (!dateStr) return "";
//   const [year, month, day] = dateStr.split("-");
//   return `${month}/${day}/${year}`;
// }

// export function setupDateInput({ inputId, minDate = null, maxDate = null }) {
//   const input = document.getElementById(inputId);
// comment out this below line
//   input.setAttribute('placeholder', 'MM/DD/YYYY');
//   if (!input) return;

//   if (minDate) input.min = minDate;
//   if (maxDate) input.max = maxDate;

//   input.addEventListener("blur", () => {
//     if (input.value) {
//       const formatted = formatDateToMMDDYYYY(input.value);
//       input.setAttribute("data-display", formatted);
//     }
//   });
// }

export function createDatepicker(input, setFormValue, fieldName, minDate, maxDate) {
  const calendar = document.createElement('div');
  calendar.className = 'calendar-single';
  let currentDate = new Date();

  function renderCalendar(date) {
    calendar.innerHTML = '';

    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const header = document.createElement('div');
    header.className = 'header';

    const prev = document.createElement('button');
    prev.textContent = '<';
    prev.type = 'button';

    const next = document.createElement('button');
    next.textContent = '>';
    next.type = 'button';

    const monthLabel = document.createElement('span');
    monthLabel.textContent = date.toLocaleString('default', {
      month: 'long',
      year: 'numeric'
    });

    header.append(prev, monthLabel, next);
    calendar.appendChild(header);

    const days = document.createElement('div');
    days.className = 'days';

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      days.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dayBtn = document.createElement('button');
      dayBtn.type = 'button';

      const btnDate = new Date(year, month, d);
      dayBtn.textContent = d;

      if ((minDate && btnDate < minDate) || (maxDate && btnDate > maxDate)) {
        dayBtn.disabled = true;
      }

      dayBtn.onclick = (e) => {
        e.stopPropagation();
        const formatted =
          String(month + 1).padStart(2, '0') +
          '/' +
          String(d).padStart(2, '0') +
          '/' +
          year;
        input.value = formatted;
        if (typeof setFormValue === 'function') {
          setFormValue(formatted); // this updates React state
        }
        calendar.classList.remove('visible');
      };

      days.appendChild(dayBtn);
    }

    calendar.appendChild(days);

    prev.onclick = (e) => {
      e.stopPropagation();
      currentDate = new Date(year, month - 1);
      renderCalendar(currentDate);
    };

    next.onclick = (e) => {
      e.stopPropagation();
      currentDate = new Date(year, month + 1);
      renderCalendar(currentDate);
    };
  }

  renderCalendar(currentDate);
  input.parentElement.appendChild(calendar);

  input.addEventListener('focus', () => {
    calendar.classList.add('visible');
  });

  document.addEventListener('click', (e) => {
    if (
      !input.parentElement.contains(e.target) &&
      !calendar.contains(e.target)
    ) {
      calendar.classList.remove('visible');
    }
  });
}