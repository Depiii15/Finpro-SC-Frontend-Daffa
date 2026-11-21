/* Interaktivitas DOM untuk JelajahIndonesia */

// Tandai bahwa JavaScript aktif (dipakai CSS untuk animasi muncul)
document.documentElement.classList.add('js');

// ===== Mode malam (disimpan di localStorage) =====
var themeToggle = document.getElementById('theme-toggle');

function applyTheme(isDark) {
    document.body.classList.toggle('dark', isDark);
    if (themeToggle) {
        themeToggle.textContent = isDark ? '☀️' : '🌙';
        themeToggle.setAttribute('aria-label', isDark ? 'Aktifkan mode terang' : 'Aktifkan mode malam');
    }
}

var savedTheme = null;
try {
    savedTheme = localStorage.getItem('theme');
} catch (e) {
    savedTheme = null;
}
applyTheme(savedTheme === 'dark');

if (themeToggle) {
    themeToggle.addEventListener('click', function () {
        var isDark = !document.body.classList.contains('dark');
        applyTheme(isDark);
        try {
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        } catch (e) {}
    });
}

// ===== Menu navigasi dinamis (hamburger di layar kecil) =====
var menuToggle = document.getElementById('menu-toggle');
var navMenu = document.getElementById('nav-menu');

function setMenu(open) {
    navMenu.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.textContent = open ? '✕' : '☰';
    menuToggle.setAttribute('aria-label', open ? 'Tutup menu navigasi' : 'Buka menu navigasi');
}

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', function () {
        setMenu(!navMenu.classList.contains('open'));
    });

    navMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            setMenu(false);
        });
    });
}

// ===== Menandai menu aktif saat di-scroll =====
var sections = document.querySelectorAll('main section[id]');
var navLinks = document.querySelectorAll('.subnav a[href^="#"]');

if ('IntersectionObserver' in window && sections.length > 0) {
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                navLinks.forEach(function (link) {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
                });
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(function (section) {
        observer.observe(section);
    });
}

// ===== Form pemesanan: validasi dan pesan konfirmasi =====
var bookingForm = document.querySelector('.booking form');
var formStatus = document.getElementById('form-status');

if (bookingForm && formStatus) {
    bookingForm.addEventListener('submit', function (event) {
        event.preventDefault();

        var nama = document.getElementById('booking-nama').value.trim();
        var email = document.getElementById('booking-email').value.trim();
        var pesan = document.getElementById('pesan').value.trim();

        if (nama === '' || pesan === '') {
            formStatus.textContent = 'Nama dan pesan tidak boleh kosong.';
            formStatus.className = 'form-status error';
            return;
        }

        formStatus.textContent = 'Terima kasih, ' + nama + '! Aplikasi email kamu akan terbuka untuk mengirim pesan.';
        formStatus.className = 'form-status success';

        var subject = encodeURIComponent('Pemesanan / Pertanyaan Raja Ampat dari ' + nama);
        var body = encodeURIComponent('Nama: ' + nama + '\nEmail: ' + email + '\n\n' + pesan);
        window.location.href = 'mailto:daffa@example.com?subject=' + subject + '&body=' + body;

        bookingForm.reset();
    });
}

// ===== Galeri: perbesar gambar (lightbox) dengan zoom in / zoom out =====
var galleryImages = document.querySelectorAll('.gallery-grid img');

if (galleryImages.length > 0) {
    var ZOOM_MIN = 1;
    var ZOOM_MAX = 5;
    var ZOOM_STEP = 1.25;

    var zoom = { scale: 1, x: 0, y: 0 };
    var pointers = {};
    var pinch = null;
    var downPoint = null;
    var dragged = false;

    var makeButton = function (text, label, className) {
        var button = document.createElement('button');
        button.type = 'button';
        button.textContent = text;
        button.setAttribute('aria-label', label);
        button.title = label;
        if (className) {
            button.className = className;
        }
        return button;
    };

    var lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Gambar diperbesar');
    lightbox.hidden = true;

    var lightboxClose = makeButton('✕', 'Tutup gambar', 'lightbox-close');

    var lightboxStage = document.createElement('div');
    lightboxStage.className = 'lightbox-stage';
    var lightboxImg = document.createElement('img');
    lightboxImg.draggable = false;
    lightboxStage.appendChild(lightboxImg);

    var lightboxCaption = document.createElement('p');

    var toolbar = document.createElement('div');
    toolbar.className = 'lightbox-toolbar';
    toolbar.setAttribute('role', 'group');
    toolbar.setAttribute('aria-label', 'Kontrol zoom');
    var zoomOutBtn = makeButton('−', 'Perkecil (zoom out)');
    var zoomLabel = document.createElement('span');
    zoomLabel.className = 'lightbox-zoom-label';
    zoomLabel.textContent = '100%';
    var zoomInBtn = makeButton('+', 'Perbesar (zoom in)');
    var zoomResetBtn = makeButton('Reset', 'Kembalikan ke ukuran semula', 'lightbox-reset');
    toolbar.appendChild(zoomOutBtn);
    toolbar.appendChild(zoomLabel);
    toolbar.appendChild(zoomInBtn);
    toolbar.appendChild(zoomResetBtn);

    var lightboxHint = document.createElement('p');
    lightboxHint.className = 'lightbox-hint';
    lightboxHint.textContent = 'Scroll atau cubit untuk zoom · geser untuk memindahkan · klik dua kali untuk memperbesar';

    lightbox.appendChild(lightboxClose);
    lightbox.appendChild(lightboxStage);
    lightbox.appendChild(lightboxCaption);
    lightbox.appendChild(toolbar);
    lightbox.appendChild(lightboxHint);
    document.body.appendChild(lightbox);

    // Batasi geseran supaya gambar tidak keluar dari bingkai
    var clampPan = function () {
        var maxX = Math.max(0, (lightboxImg.offsetWidth * zoom.scale - lightboxStage.clientWidth) / 2);
        var maxY = Math.max(0, (lightboxImg.offsetHeight * zoom.scale - lightboxStage.clientHeight) / 2);
        zoom.x = Math.min(maxX, Math.max(-maxX, zoom.x));
        zoom.y = Math.min(maxY, Math.max(-maxY, zoom.y));
    };

    var renderZoom = function () {
        clampPan();
        lightboxImg.style.transform =
            'translate(' + zoom.x + 'px, ' + zoom.y + 'px) scale(' + zoom.scale + ')';
        zoomLabel.textContent = Math.round(zoom.scale * 100) + '%';
        zoomOutBtn.disabled = zoom.scale <= ZOOM_MIN;
        zoomInBtn.disabled = zoom.scale >= ZOOM_MAX;
        zoomResetBtn.disabled = zoom.scale === ZOOM_MIN && zoom.x === 0 && zoom.y === 0;
        lightboxStage.classList.toggle('zoomed', zoom.scale > ZOOM_MIN);
    };

    // Titik fokus (fx, fy) dihitung dari pusat bingkai gambar
    var focalPoint = function (clientX, clientY) {
        var rect = lightboxStage.getBoundingClientRect();
        return {
            x: clientX - (rect.left + rect.width / 2),
            y: clientY - (rect.top + rect.height / 2)
        };
    };

    var setScale = function (next, fx, fy) {
        next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
        var ratio = next / zoom.scale;
        zoom.x = fx - (fx - zoom.x) * ratio;
        zoom.y = fy - (fy - zoom.y) * ratio;
        zoom.scale = next;
        renderZoom();
    };

    var resetZoom = function () {
        zoom.scale = 1;
        zoom.x = 0;
        zoom.y = 0;
        renderZoom();
    };

    var closeLightbox = function () {
        lightbox.hidden = true;
        document.body.classList.remove('no-scroll');
        pointers = {};
        pinch = null;
        lightboxStage.classList.remove('dragging');
        resetZoom();
    };

    galleryImages.forEach(function (img) {
        img.tabIndex = 0;
        var open = function () {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            var caption = img.parentElement.querySelector('figcaption');
            lightboxCaption.textContent = caption ? caption.textContent : '';
            lightbox.hidden = false;
            document.body.classList.add('no-scroll');
            resetZoom();
            lightboxClose.focus();
        };
        img.addEventListener('click', open);
        img.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                open();
            }
        });
    });

    // Tombol zoom
    zoomInBtn.addEventListener('click', function () {
        setScale(zoom.scale * ZOOM_STEP, 0, 0);
    });
    zoomOutBtn.addEventListener('click', function () {
        setScale(zoom.scale / ZOOM_STEP, 0, 0);
    });
    zoomResetBtn.addEventListener('click', resetZoom);

    // Scroll mouse / cubit di touchpad
    lightboxStage.addEventListener('wheel', function (event) {
        event.preventDefault();
        var delta = event.deltaMode === 1 ? event.deltaY * 33 : event.deltaY;
        var speed = event.ctrlKey ? 0.01 : 0.002;
        var focal = focalPoint(event.clientX, event.clientY);
        setScale(zoom.scale * Math.exp(-delta * speed), focal.x, focal.y);
    }, { passive: false });

    // Klik dua kali: perbesar / kembali ke ukuran semula
    lightboxImg.addEventListener('dblclick', function (event) {
        var focal = focalPoint(event.clientX, event.clientY);
        setScale(zoom.scale > ZOOM_MIN ? ZOOM_MIN : 2.5, focal.x, focal.y);
    });

    // Geser gambar (1 jari / mouse) dan cubit (2 jari)
    lightbox.addEventListener('pointerdown', function () {
        dragged = false;
    }, true);

    lightboxStage.addEventListener('pointerdown', function (event) {
        pointers[event.pointerId] = { x: event.clientX, y: event.clientY };
        downPoint = { x: event.clientX, y: event.clientY };
        var ids = Object.keys(pointers);
        if (ids.length === 2) {
            var a = pointers[ids[0]];
            var b = pointers[ids[1]];
            pinch = {
                dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
                scale: zoom.scale,
                mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
            };
        }
    });

    lightboxStage.addEventListener('pointermove', function (event) {
        var prev = pointers[event.pointerId];
        if (!prev) {
            return;
        }
        pointers[event.pointerId] = { x: event.clientX, y: event.clientY };
        var ids = Object.keys(pointers);

        if (ids.length >= 2 && pinch) {
            var a = pointers[ids[0]];
            var b = pointers[ids[1]];
            var dist = Math.hypot(a.x - b.x, a.y - b.y);
            var mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
            var focal = focalPoint(mid.x, mid.y);
            dragged = true;
            lightboxStage.classList.add('dragging');
            setScale(pinch.scale * dist / pinch.dist, focal.x, focal.y);
            zoom.x += mid.x - pinch.mid.x;
            zoom.y += mid.y - pinch.mid.y;
            renderZoom();
            pinch.mid = mid;
            return;
        }

        if (zoom.scale > ZOOM_MIN && downPoint) {
            var moved = Math.hypot(event.clientX - downPoint.x, event.clientY - downPoint.y);
            if (!dragged && moved < 4) {
                return;
            }
            if (!dragged) {
                dragged = true;
                lightboxStage.classList.add('dragging');
                try {
                    lightboxStage.setPointerCapture(event.pointerId);
                } catch (e) {}
            }
            zoom.x += event.clientX - prev.x;
            zoom.y += event.clientY - prev.y;
            renderZoom();
        }
    });

    var endPointer = function (event) {
        delete pointers[event.pointerId];
        if (Object.keys(pointers).length < 2) {
            pinch = null;
        }
        if (Object.keys(pointers).length === 0) {
            lightboxStage.classList.remove('dragging');
        }
    };
    lightboxStage.addEventListener('pointerup', endPointer);
    lightboxStage.addEventListener('pointercancel', endPointer);

    // Klik di luar gambar menutup lightbox (kecuali setelah menggeser gambar)
    lightbox.addEventListener('click', function (event) {
        if (dragged) {
            dragged = false;
            return;
        }
        if (event.target === lightbox || event.target === lightboxStage || event.target === lightboxClose) {
            closeLightbox();
        }
    });

    // Keyboard: Esc tutup, + / - zoom, 0 reset
    document.addEventListener('keydown', function (event) {
        if (lightbox.hidden) {
            return;
        }
        if (event.key === 'Escape') {
            closeLightbox();
        } else if (event.key === '+' || event.key === '=') {
            setScale(zoom.scale * ZOOM_STEP, 0, 0);
        } else if (event.key === '-' || event.key === '_') {
            setScale(zoom.scale / ZOOM_STEP, 0, 0);
        } else if (event.key === '0') {
            resetZoom();
        }
    });

    window.addEventListener('resize', function () {
        if (!lightbox.hidden) {
            renderZoom();
        }
    });
}

// ===== Checklist persiapan: tambah, hapus, centang, simpan =====
var checklist = document.getElementById('checklist');
var checklistProgress = document.getElementById('checklist-progress');
var checklistForm = document.getElementById('checklist-form');
var checklistInput = document.getElementById('checklist-input');
var checklistMessage = document.getElementById('checklist-message');
var checklistReset = document.getElementById('checklist-reset');

if (checklist && checklistProgress && checklistForm && checklistInput) {
    // Daftar awal diambil dari HTML (5 barang bawaan)
    var defaultItems = [];
    checklist.querySelectorAll('li').forEach(function (li) {
        defaultItems.push({ text: li.textContent.trim(), checked: false });
    });

    var items = defaultItems.map(function (item) {
        return { text: item.text, checked: false };
    });

    // Muat daftar yang tersimpan (jika ada)
    try {
        var saved = JSON.parse(localStorage.getItem('checklistItems'));
        if (Array.isArray(saved)) {
            items = saved.filter(function (item) {
                return item && typeof item.text === 'string';
            });
        }
    } catch (e) {}

    var saveItems = function () {
        try {
            localStorage.setItem('checklistItems', JSON.stringify(items));
        } catch (e) {}
    };

    var setMessage = function (text) {
        if (checklistMessage) {
            checklistMessage.textContent = text;
        }
    };

    var renderChecklist = function () {
        checklist.innerHTML = '';

        items.forEach(function (item, index) {
            var li = document.createElement('li');
            li.classList.toggle('checked', item.checked);

            var label = document.createElement('label');
            var box = document.createElement('input');
            box.type = 'checkbox';
            box.checked = item.checked;
            box.dataset.index = index;

            var span = document.createElement('span');
            span.textContent = item.text;

            label.appendChild(box);
            label.appendChild(span);

            var removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'checklist-remove';
            removeBtn.dataset.index = index;
            removeBtn.setAttribute('aria-label', 'Hapus ' + item.text);
            removeBtn.textContent = '✕';

            li.appendChild(label);
            li.appendChild(removeBtn);
            checklist.appendChild(li);
        });

        var done = items.filter(function (item) {
            return item.checked;
        }).length;

        if (items.length === 0) {
            checklistProgress.textContent = 'Daftar kosong. Tambahkan barang di atas.';
        } else if (done === items.length) {
            checklistProgress.textContent = 'Semua barang sudah siap, selamat berlibur!';
        } else {
            checklistProgress.textContent = done + ' dari ' + items.length + ' barang siap';
        }
    };

    // Tambah barang
    checklistForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var text = checklistInput.value.trim();

        if (text === '') {
            setMessage('Tulis nama barang dulu ya.');
            return;
        }

        var exists = items.some(function (item) {
            return item.text.toLowerCase() === text.toLowerCase();
        });
        if (exists) {
            setMessage('Barang itu sudah ada di daftar.');
            return;
        }

        items.push({ text: text, checked: false });
        saveItems();
        renderChecklist();
        setMessage('"' + text + '" ditambahkan.');
        checklistInput.value = '';
        checklistInput.focus();
    });

    // Centang barang
    checklist.addEventListener('change', function (event) {
        if (event.target.type === 'checkbox') {
            items[Number(event.target.dataset.index)].checked = event.target.checked;
            saveItems();
            renderChecklist();
        }
    });

    // Hapus barang
    checklist.addEventListener('click', function (event) {
        var btn = event.target.closest('.checklist-remove');
        if (!btn) {
            return;
        }
        var removed = items.splice(Number(btn.dataset.index), 1)[0];
        saveItems();
        renderChecklist();
        setMessage('"' + removed.text + '" dihapus.');
    });

    // Kembalikan ke 5 barang awal
    if (checklistReset) {
        checklistReset.addEventListener('click', function () {
            items = defaultItems.map(function (item) {
                return { text: item.text, checked: false };
            });
            saveItems();
            renderChecklist();
            setMessage('Daftar dikembalikan ke 5 barang awal.');
        });
    }

    renderChecklist();
}


// ===== Halaman utama: cari destinasi =====
var destSearch = document.getElementById('dest-search');
var destGrid = document.getElementById('dest-grid');
var destCount = document.getElementById('dest-count');
var destEmpty = document.getElementById('dest-empty');

if (destSearch && destGrid) {
    var destCards = destGrid.querySelectorAll('.dest-card');

    var filterDestinations = function () {
        var query = destSearch.value.trim().toLowerCase();
        var shown = 0;

        destCards.forEach(function (card) {
            var match = card.textContent.toLowerCase().indexOf(query) !== -1;
            card.hidden = !match;
            if (match) {
                shown++;
            }
        });

        if (destCount) {
            destCount.textContent = 'Menampilkan ' + shown + ' dari ' + destCards.length + ' destinasi';
        }
        if (destEmpty) {
            destEmpty.hidden = shown !== 0;
        }
    };

    destSearch.addEventListener('input', filterDestinations);

    var destForm = document.getElementById('dest-search-form');
    if (destForm) {
        destForm.addEventListener('submit', function (event) {
            event.preventDefault();
        });
    }

    filterDestinations();
}

// ===== Pesan kecil (toast) untuk destinasi yang belum tersedia =====
var toast = document.getElementById('toast');
var toastTimer = null;

if (toast) {
    document.querySelectorAll('.dest-link.soon').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var name = btn.closest('.dest-card').querySelector('h3').textContent;
            toast.textContent = name + ' segera hadir. Untuk sekarang, jelajahi Raja Ampat dulu ya!';
            toast.hidden = false;
            clearTimeout(toastTimer);
            toastTimer = setTimeout(function () {
                toast.hidden = true;
            }, 3000);
        });
    });
}

// ===== Tombol kembali ke atas =====
var backToTop = document.createElement('button');
backToTop.type = 'button';
backToTop.className = 'back-to-top';
backToTop.setAttribute('aria-label', 'Kembali ke atas');
backToTop.textContent = '↑';
backToTop.hidden = true;
document.body.appendChild(backToTop);

window.addEventListener('scroll', function () {
    backToTop.hidden = window.scrollY < 400;
});

backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== Animasi muncul saat di-scroll =====
var revealTargets = document.querySelectorAll(
    '.activity-card, .recommend-grid article, .dest-card, .gallery-grid figure, .table-wrap'
);

if ('IntersectionObserver' in window && revealTargets.length > 0) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealTargets.forEach(function (el) {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });
}
