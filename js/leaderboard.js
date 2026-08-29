(function () {
  var DATA_URL = 'data/players.csv';
  var NUMERIC_COLS = ['PA','PoR','BA','xBA','BA_Diff','SLG','xSLG','SLG_Diff','wOBA','xwOBA','OBA_Diff','BABIP'];
  var DECIMAL_COLS = ['BA','xBA','BA_Diff','SLG','xSLG','SLG_Diff','wOBA','xwOBA','OBA_Diff','BABIP'];

  var allRows = [];
  var lastFilteredRows = [];
  var sortKey = 'PoR';
  var sortDir = 'desc';

  function parseCSV(text) {
    var lines = text.trim().split(/\r?\n/);
    var headers = lines[0].split(',').map(function (h) { return h.trim(); });
    var rows = [];
    for (var i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      var cells = lines[i].split(',');
      var row = {};
      headers.forEach(function (h, idx) {
        var raw = cells[idx] !== undefined ? cells[idx].trim() : '';
        row[h] = NUMERIC_COLS.indexOf(h) !== -1 ? parseFloat(raw) : raw;
      });
      rows.push(row);
    }
    return rows;
  }

  function uniqueSorted(rows, key) {
    var set = {};
    rows.forEach(function (r) { if (r[key]) set[r[key]] = true; });
    return Object.keys(set).sort();
  }

  function populateFilter(selectEl, values) {
    values.forEach(function (v) {
      var opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      selectEl.appendChild(opt);
    });
  }

  function formatCell(key, value) {
    if (value === undefined || value === null || value === '' || (typeof value === 'number' && isNaN(value))) return '&mdash;';
    if (key === 'PoR') return Number(value).toFixed(1);
    if (DECIMAL_COLS.indexOf(key) !== -1) {
      var s = Number(value).toFixed(3);
      return (value >= 0 && key.indexOf('Diff') !== -1 ? '+' : '') + s;
    }
    return value;
  }

  function porStyle(value) {
    if (value === undefined || value === null || isNaN(value)) return '';
    var bg, color = '#1B2430';
    if (value >= 90)      { bg = '#1B7A3D'; color = '#FAF7EF'; }
    else if (value >= 80) { bg = '#4C9950'; color = '#FAF7EF'; }
    else if (value >= 65) { bg = '#8FC17E'; }
    else if (value >= 55) { bg = '#C7E2A4'; }
    else if (value >= 45) { bg = '#F0D670'; }
    else if (value >= 35) { bg = '#F0A79C'; }
    else if (value >= 20) { bg = '#E0655A'; color = '#FAF7EF'; }
    else                  { bg = '#B93A30'; color = '#FAF7EF'; }
    return 'background-color:' + bg + '; color:' + color + ';';
  }

  function exportToCSV() {
    var cols = ['Name','Team','PA','PoR','BA','xBA','BA_Diff','SLG','xSLG','SLG_Diff','wOBA','xwOBA','OBA_Diff','BABIP'];
    var headerLabels = ['Name','Team','PA','PoR','BA','xBA','BA Diff','SLG','xSLG','SLG Diff','wOBA','xwOBA','OBA Diff','BABIP'];

    function csvEscape(val) {
      var s = (val === undefined || val === null) ? '' : String(val);
      if (s.indexOf(',') !== -1 || s.indexOf('"') !== -1 || s.indexOf('\n') !== -1) {
        s = '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    }

    var rows = lastFilteredRows.map(function (r) {
      return cols.map(function (c) {
        var v = r[c];
        if (typeof v === 'number' && isNaN(v)) v = '';
        return csvEscape(v);
      }).join(',');
    });

    var csv = headerLabels.map(csvEscape).join(',') + '\r\n' + rows.join('\r\n');
    var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = 'por-leaderboard-' + stamp + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function applyFiltersAndSort() {
    var year = document.getElementById('f-year').value;
    var team = document.getElementById('f-team').value;
    var pos = document.getElementById('f-pos').value;
    var minPA = parseInt(document.getElementById('f-pa').value, 10) || 0;

    var filtered = allRows.filter(function (r) {
      if (year && String(r.Year) !== String(year)) return false;
      if (team && r.Team !== team) return false;
      if (pos && r.Position !== pos) return false;
      if ((r.PA || 0) < minPA) return false;
      return true;
    });

    filtered.sort(function (a, b) {
      var av = a[sortKey], bv = b[sortKey];
      var cmp;
      if (typeof av === 'number' && typeof bv === 'number') {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv));
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    lastFilteredRows = filtered;
    renderRows(filtered);
    document.getElementById('rowcount').textContent =
      filtered.length + (filtered.length === 1 ? ' player shown' : ' players shown') +
      ' (out of ' + allRows.length + ' total)';
  }

  function renderRows(rows) {
    var cols = ['Name','Team','PA','PoR','BA','xBA','BA_Diff','SLG','xSLG','SLG_Diff','wOBA','xwOBA','OBA_Diff','BABIP'];
    var tbody = document.getElementById('leaderboard-body');
    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="14" style="text-align:center; opacity:.6; padding:24px;">No players match these filters.</td></tr>';
      return;
    }
    var html = rows.map(function (r) {
      var cells = cols.map(function (c) {
        if (c === 'Name') return '<td class="name">' + formatCell(c, r[c]) + '</td>';
        if (c === 'PoR') return '<td style="' + porStyle(r.PoR) + '">' + formatCell(c, r[c]) + '</td>';
        return '<td>' + formatCell(c, r[c]) + '</td>';
      }).join('');
      return '<tr>' + cells + '</tr>';
    }).join('');
    tbody.innerHTML = html;
  }

  function updateSortHeaders() {
    document.querySelectorAll('#leaderboard th[data-key]').forEach(function (th) {
      th.classList.toggle('sorted', th.dataset.key === sortKey);
      var arrow = th.querySelector('.arrow');
      if (!arrow) return;
      if (th.dataset.key === sortKey) {
        arrow.innerHTML = sortDir === 'asc' ? '&uarr;' : '&darr;';
      } else {
        arrow.innerHTML = '&#8597;';
      }
    });
  }

  function init(rows) {
    allRows = rows;
    var FULL_YEAR_RANGE = ['2026','2025','2024','2023','2022','2021'];
    populateFilter(document.getElementById('f-year'), FULL_YEAR_RANGE);
    populateFilter(document.getElementById('f-team'), uniqueSorted(rows, 'Team'));
    populateFilter(document.getElementById('f-pos'), uniqueSorted(rows, 'Position'));

    document.getElementById('f-year').addEventListener('change', applyFiltersAndSort);
    document.getElementById('f-team').addEventListener('change', applyFiltersAndSort);
    document.getElementById('f-pos').addEventListener('change', applyFiltersAndSort);
    document.getElementById('f-pa').addEventListener('change', applyFiltersAndSort);

    var poronly = document.getElementById('f-poronly');
    poronly.addEventListener('change', function () {
      document.getElementById('leaderboard').classList.toggle('por-only', poronly.checked);
    });

    // default Year to the current season (2026), regardless of what years have data yet
    var DEFAULT_YEAR = '2026';
    var yearSelect = document.getElementById('f-year');
    yearSelect.value = DEFAULT_YEAR;

    document.getElementById('reset-filters').addEventListener('click', function () {
      document.getElementById('f-year').value = DEFAULT_YEAR;
      document.getElementById('f-team').value = '';
      document.getElementById('f-pos').value = '';
      document.getElementById('f-pa').value = '0';
      poronly.checked = false;
      document.getElementById('leaderboard').classList.remove('por-only');
      applyFiltersAndSort();
    });

    document.querySelectorAll('#leaderboard th[data-key]').forEach(function (th) {
      th.addEventListener('click', function () {
        var key = th.dataset.key;
        if (sortKey === key) {
          sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          sortKey = key;
          sortDir = 'desc';
        }
        updateSortHeaders();
        applyFiltersAndSort();
      });
    });

    document.getElementById('export-csv').addEventListener('click', exportToCSV);

    updateSortHeaders();
    applyFiltersAndSort();
  }

  fetch(DATA_URL)
    .then(function (res) { return res.text(); })
    .then(function (text) { init(parseCSV(text)); })
    .catch(function (err) {
      document.getElementById('rowcount').textContent = 'Could not load player data (' + err + ').';
      console.error(err);
    });
})();
