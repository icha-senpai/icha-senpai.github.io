// JS for hide/unhide columns E and F in Handsontable
// Assumes table is initialized as 'hot' and columns E (index 4) and F (index 5)

// Initialize toolbar when Handsontable is ready. This avoids polling and races.
function initHotToolbar() {
  var container = document.getElementById('hot-container');
  if (!container) {
    console.warn('commodity-table.js: #hot-container not found; toolbar will not be initialized');
    return;
  }
  var hot = container.handsontableInstance;
  if (!hot) {
    console.warn('commodity-table.js: initHotToolbar called but hot instance not attached yet');
    return;
  }
  console.log('commodity-table.js: Handsontable instance found — initializing toolbar');

      // Prefer the static toolbar if present in the HTML; otherwise create it dynamically
      var toolbar = document.getElementById('hot-toolbar');
      if (!toolbar) {
        toolbar = document.createElement('div');
        toolbar.id = 'hot-toolbar';
        var navbar = document.querySelector('.navbar');
        if (navbar && navbar.parentNode) {
          navbar.parentNode.insertBefore(toolbar, navbar.nextSibling);
        } else {
          document.body.insertBefore(toolbar, document.body.firstChild.nextSibling);
        }
        var inner = document.createElement('div');
        inner.className = 'hot-toolbar-inner';
        inner.innerHTML = `
          <button id="toggle-ef" class="btn btn-warning btn-sm me-2" aria-pressed="false">Toggle Extra Stops</button>
          <button id="toggle-extra-rows" class="btn btn-info btn-sm me-2" aria-pressed="false">Toggle Extra Rows</button>
          <span id="hot-aria-live" class="visually-hidden" aria-live="polite" aria-atomic="true"></span>
        `;
        toolbar.appendChild(inner);
      }

    // State for column visibility. Try to infer from settings; fallback to true since page initially hides them.
    var hiddenColsSetting = (hot.getSettings && hot.getSettings().hiddenColumns) || {};
    var extraColsHidden = Array.isArray(hiddenColsSetting.columns) ? hiddenColsSetting.columns.includes(4) || hiddenColsSetting.columns.includes(5) : true;

    // Track extra rows state; default to false (visible) unless plugin hides them
    var extraRowsHidden = false;
    try {
      var hiddenRowsSetting = (hot.getSettings && hot.getSettings().hiddenRows) || {};
      if (Array.isArray(hiddenRowsSetting.rows) && hiddenRowsSetting.rows.length > 0) {
        extraRowsHidden = true;
      }
    } catch (e) {/* ignore */}

    var colToggleBtn = document.getElementById('toggle-ef');
    var rowsToggleBtn = document.getElementById('toggle-extra-rows');
    var ariaLive = document.getElementById('hot-aria-live');

    // Ensure the button has an icon and a label span to avoid overwriting children
    function ensureButtonStructure(btn, defaultLabel) {
      if (!btn) return { icon: null, label: null };
      var icon = btn.querySelector('.hot-toggle-icon');
      var label = btn.querySelector('.hot-toggle-label');
      if (!icon || !label) {
        // capture existing text to preserve it
        var existing = btn.textContent || defaultLabel || '';
        btn.innerHTML = '';
        icon = document.createElement('span');
        icon.className = 'hot-toggle-icon';
        label = document.createElement('span');
        label.className = 'hot-toggle-label';
        label.textContent = existing.trim();
        btn.appendChild(icon);
        btn.appendChild(label);
      }
      return { icon: icon, label: label };
    }

    var colParts = ensureButtonStructure(colToggleBtn, 'Toggle Extra Stops');
    var colIcon = colParts.icon, colLabel = colParts.label;

    function updateColButton() {
      if (!colToggleBtn) return;
      if (extraColsHidden) {
        if (colLabel) colLabel.textContent = 'Show Extra Stops';
        colToggleBtn.classList.remove('btn-outline-secondary');
        colToggleBtn.classList.add('btn-warning');
        colToggleBtn.setAttribute('aria-pressed', 'false');
        if (colIcon) colIcon.textContent = '\u25CB';
        colToggleBtn.classList.remove('hot-toggle-active');
      } else {
        if (colLabel) colLabel.textContent = 'Hide Extra Stops';
        colToggleBtn.classList.remove('btn-warning');
        colToggleBtn.classList.add('btn-outline-secondary');
        colToggleBtn.setAttribute('aria-pressed', 'true');
        if (colIcon) colIcon.textContent = '\u25CF';
        colToggleBtn.classList.add('hot-toggle-active');
      }
    }

    var rowParts = ensureButtonStructure(rowsToggleBtn, 'Toggle Extra Rows');
    var rowIcon = rowParts.icon, rowLabel = rowParts.label;

    function updateRowsButton(state) {
      if (!rowsToggleBtn) return;
      if (state) {
        if (rowLabel) rowLabel.textContent = 'Show Extra Rows';
        rowsToggleBtn.setAttribute('aria-pressed', 'false');
        if (rowIcon) rowIcon.textContent = '\u25CB';
        rowsToggleBtn.classList.remove('hot-toggle-active');
      } else {
        if (rowLabel) rowLabel.textContent = 'Hide Extra Rows';
        rowsToggleBtn.setAttribute('aria-pressed', 'true');
        if (rowIcon) rowIcon.textContent = '\u25CF';
        rowsToggleBtn.classList.add('hot-toggle-active');
      }
    }

    // Initialize button text based on inferred state
    updateColButton();
    updateRowsButton(extraRowsHidden);

    // Add icons to buttons for quick visual state
    if (colToggleBtn && !colToggleBtn.querySelector('.hot-toggle-icon')) {
      var span = document.createElement('span');
      span.className = 'hot-toggle-icon';
      span.textContent = extraColsHidden ? '\u25CB' : '\u25CF'; // hollow/filled circle
      colToggleBtn.insertBefore(span, colToggleBtn.firstChild);
    }
    if (rowsToggleBtn && !rowsToggleBtn.querySelector('.hot-toggle-icon')) {
      var span2 = document.createElement('span');
      span2.className = 'hot-toggle-icon';
      span2.textContent = extraRowsHidden ? '\u25CB' : '\u25CF';
      rowsToggleBtn.insertBefore(span2, rowsToggleBtn.firstChild);
    }

    // Toggle columns
    if (colToggleBtn) {
      colToggleBtn.addEventListener('click', function() {
        try {
          var plugin = hot.getPlugin('hiddenColumns');
          if (extraColsHidden) {
            plugin.showColumns([4,5]);
            extraColsHidden = false;
            ariaLive && (ariaLive.textContent = 'Extra Stops columns are now visible');
          } else {
            plugin.hideColumns([4,5]);
            extraColsHidden = true;
            ariaLive && (ariaLive.textContent = 'Extra Stops columns are now hidden');
          }
          updateColButton();
          // update icon
          var icon = colToggleBtn && colToggleBtn.querySelector('.hot-toggle-icon');
          if (icon) icon.textContent = extraColsHidden ? '\u25CB' : '\u25CF';
          // toggle active class for visual cue
          if (colToggleBtn) {
            if (!extraColsHidden) colToggleBtn.classList.add('hot-toggle-active'); else colToggleBtn.classList.remove('hot-toggle-active');
          }
          hot.render();
          showHotToast(extraColsHidden ? 'Extra Stops hidden' : 'Extra Stops visible');
        } catch (e) {
          console.error('Failed to toggle extra columns', e);
        }
      });
    }

    // Toggle extra rows (rows 15 to 123, 0-based index 14-122)
    if (rowsToggleBtn) {
      rowsToggleBtn.addEventListener('click', function() {
        try {
          var hiddenRowsPlugin = hot.getPlugin('hiddenRows');
          var targetRows = Array.from({length: 109}, (_, i) => i + 14);
          if (!extraRowsHidden) {
            hiddenRowsPlugin.hideRows(targetRows);
            extraRowsHidden = true;
            ariaLive && (ariaLive.textContent = 'Extra rows are now hidden');
          } else {
            hiddenRowsPlugin.showRows(targetRows);
            extraRowsHidden = false;
            ariaLive && (ariaLive.textContent = 'Extra rows are now visible');
          }
          updateRowsButton(extraRowsHidden);
          var icon2 = rowsToggleBtn && rowsToggleBtn.querySelector('.hot-toggle-icon');
          if (icon2) icon2.textContent = extraRowsHidden ? '\u25CB' : '\u25CF';
          if (rowsToggleBtn) {
            if (!extraRowsHidden) rowsToggleBtn.classList.add('hot-toggle-active'); else rowsToggleBtn.classList.remove('hot-toggle-active');
          }
          hot.render();
          showHotToast(extraRowsHidden ? 'Extra rows hidden' : 'Extra rows visible');
        } catch (e) {
          console.error('Failed to toggle extra rows', e);
        }
      });
    }
  }

// Listen for the explicit event dispatched by the table initializer
document.addEventListener('hot-ready', function() {
  try {
    initHotToolbar();
  } catch (e) {
    console.error('commodity-table.js: unexpected error initializing toolbar', e);
  }
});

// Fallback: attach on DOMContentLoaded in case the event fired before this script loaded
document.addEventListener('DOMContentLoaded', function() {
  // if the hot instance already exists, initialize immediately
  initHotToolbar();
});

// Toast helper: shows a small sighted notification for a short time
function showHotToast(message) {
  if (!message) return;
  var toastRoot = document.getElementById('hot-toast');
  if (!toastRoot) {
    toastRoot = document.createElement('div');
    toastRoot.id = 'hot-toast';
    document.body.appendChild(toastRoot);
  }
  toastRoot.innerHTML = '';
  var inner = document.createElement('div');
  inner.className = 'hot-toast-inner';
  inner.textContent = message;
  toastRoot.appendChild(inner);
  // show
  requestAnimationFrame(function() { inner.classList.add('show'); });
  // hide after 1800ms
  setTimeout(function() { inner.classList.remove('show'); }, 1800);
  // remove after transition
  setTimeout(function() { try { toastRoot.removeChild(inner); } catch (e) {} }, 2200);
}
