(() => {
  let userToken = localStorage.getItem('beeboard_jwt_token') || null;
  let cachedProjects = [];
  let selectedProject = null;
  let projectsLoaded = false;
  let selectedMainCategory = null; // تخزين الفئة الرئيسية المختارة

  const arrowSection = document.getElementById('arrow-section');
  const projectDropdown = document.getElementById('projectDropdown');
  const projectDropdownContent = document.getElementById('projectDropdownContent');
  const membersSectionTitle = document.querySelector('.members-section .text-section .title');
  const membersSectionRole = document.querySelector('.members-section .text-section .role');
  const membersSectionOwnerTag = document.querySelector('.members-section .owner-tag');
  const mainBarCategory = document.querySelector('.main-bar-category');
  const mainContent = document.querySelector('main.main-content');

  console.log('DOM elements loaded:', {
    arrowSection, projectDropdown, projectDropdownContent,
    membersSectionTitle, membersSectionRole, membersSectionOwnerTag,
    mainBarCategory, mainContent
  });

  function openProjectDropdown() {
    console.log('Opening project dropdown');
    projectDropdown.style.display = 'block';
    projectDropdown.style.visibility = 'visible';
    projectDropdown.style.opacity = '1';
  }
  function closeProjectDropdown() {
    console.log('Closing project dropdown');
    projectDropdown.style.display = 'none';
    projectDropdown.style.visibility = 'hidden';
    projectDropdown.style.opacity = '0';
  }

  function safeText(v) { return (v === null || v === undefined) ? '' : String(v); }

  // جلب تفاصيل مشروع واحد حسب project_id
  async function fetchProjectDetails(project_id) {
    if (!userToken) {
      console.warn('لا يوجد توكن لجلب تفاصيل المشروع');
      return null;
    }
    try {
      console.log(`Fetching project details for project_id=${project_id}`);
      const res = await fetch(`https://beeboard-production-b072.up.railway.app/api/project/${project_id}`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      if (!res.ok) {
        console.error(`فشل في جلب تفاصيل المشروع ${project_id}: ${res.status}`);
        return null;
      }
      const json = await res.json();
      console.log('Project details fetched:', json);
      return json.data ?? null;
    } catch (err) {
      console.error('خطأ في fetchProjectDetails:', err);
      return null;
    }
  }

  async function fetchProjects() {
    console.log('fetchProjects called');
    if (!userToken) {
      console.warn('لا يوجد توكن في localStorage — قم بتسجيل الدخول أولاً.');
      return;
    }

    try {
      console.log('Fetching projects with token:', userToken);
      const res = await fetch('https://beeboard-production-b072.up.railway.app/api/project_user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json',
        }
      });

      if (!res.ok) {
        console.error(`فشل في جلب المشاريع: ${res.status}`);
        return;
      }
      const json = await res.json();
      console.log('Projects fetched:', json);

      let projectsRaw = Array.isArray(json.data) ? json.data : [];
      console.log(`Number of projects raw: ${projectsRaw.length}`);

      // جلب تفاصيل كل مشروع (name, description, ...) ودمجها مع المشروع الأصلي
      cachedProjects = [];
      for (const p of projectsRaw) {
        const details = await fetchProjectDetails(p.project_id);
        if (details) {
          // دمج بيانات المشروع مع تفاصيل المشروع
          const fullProject = { ...p, ...details };
          cachedProjects.push(fullProject);
        } else {
          cachedProjects.push(p); // إذا ما حصلنا تفاصيل خليها كما هي
        }
      }
      projectsLoaded = true;

      console.log('Cached projects with details:', cachedProjects);

      renderProjectsDropdown(cachedProjects);

      if (!selectedProject && cachedProjects.length > 0) {
        console.log('Selecting first project by default:', cachedProjects[0]);
        selectProject(cachedProjects[0]);
      } else if (cachedProjects.length === 0) {
        console.log('لا توجد مشاريع، تنظيف الواجهة');
        updateMembersSection(null);
        clearMainCategoriesAndCards();
      }

    } catch (err) {
      console.error('خطأ أثناء fetchProjects:', err);
    }
  }

  function renderProjectsDropdown(projects) {
    console.log('Rendering projects dropdown, عدد المشاريع:', projects.length);
    if (!projectDropdownContent) {
      console.warn('projectDropdownContent غير موجود في الصفحة');
      return;
    }
    projectDropdownContent.innerHTML = '';

    if (!projects || projects.length === 0) {
      projectDropdownContent.innerHTML = `<div style="padding:12px; color:#666">لا توجد مشاريع</div>`;
      return;
    }

    projects.forEach(project => {
      const item = document.createElement('div');
      item.className = 'title';
      item.dataset.projectId = project.id ?? '';
      item.dataset.projectName = project.name ?? '';

      item.innerHTML = `
        <div class="project-info" style="padding:8px 10px;">
          <div class="project-name" style="font-weight:600;">${safeText(project.name)}</div>
          <div class="project-role" style="font-size:12px; color:#777;">${safeText(project.role || 'عضو')}</div>
          <div class="project-members" style="font-size:12px; color:#777;">${(project.users?.length ?? 0)} عضو</div>
        </div>
      `;

      item.addEventListener('click', () => {
        console.log('Project selected:', project);
        selectProject(project);
        closeProjectDropdown();
      });

      projectDropdownContent.appendChild(item);
    });
  }

  async function selectProject(project) {
    if (!project) {
      console.warn('selectProject استدعيت بدون مشروع');
      return;
    }
    selectedProject = project;
    console.log('Project selected:', project);

    updateMembersSection(project);

    showProjectInfo(project);

    await loadMainCategories(project.project_id || project.id);
  }

  function updateMembersSection(project) {
    console.log('Updating members section for project:', project ? project.name : 'none');
    if (!membersSectionTitle) {
      console.warn('membersSectionTitle غير موجود');
      return;
    }
    if (!project) {
      membersSectionTitle.textContent = '';
      if (membersSectionRole) membersSectionRole.textContent = '';
      if (membersSectionOwnerTag) membersSectionOwnerTag.style.display = 'none';
      return;
    }

    membersSectionTitle.textContent = safeText(project.name);
    if (membersSectionRole) membersSectionRole.textContent = project.role ? safeText(project.role) : '';
    if (membersSectionOwnerTag) {
      if ((project.role && project.role.toLowerCase().includes('owner')) || project.is_owner) {
        membersSectionOwnerTag.style.display = 'inline-block';
        membersSectionOwnerTag.textContent = 'مالك';
      } else {
        membersSectionOwnerTag.style.display = 'none';
      }
    }
  }

  function showProjectInfo(project) {
    console.log('Showing project info for:', project.name);
    const nameEl = document.getElementById('projectInfoName');
    const descEl = document.getElementById('projectInfoDesc');
    const imgEl = document.getElementById('projectInfoImage');
    const membersList = document.getElementById('projectInfoMembers');

    if (nameEl) nameEl.textContent = safeText(project.name);
    if (descEl) descEl.textContent = safeText(project.description || 'لا يوجد وصف');

    if (imgEl) {
      if (project.image_url) {
        imgEl.src = project.image_url;
        imgEl.style.display = 'block';
      } else {
        imgEl.style.display = 'none';
      }
    }

    if (membersList) {
      membersList.innerHTML = '';
      const users = project.users ?? [];
      if (users.length === 0) {
        membersList.innerHTML = '<li>لا يوجد أعضاء</li>';
      } else {
        users.forEach(u => {
          const li = document.createElement('li');
          li.textContent = u.name ?? u.email ?? 'عضو';
          membersList.appendChild(li);
        });
      }
    }
  }

  async function loadMainCategories(projectId) {
    console.log('loadMainCategories for projectId:', projectId);
    if (!userToken) {
      console.warn('لا يوجد توكن لتحميل الفئات الرئيسية');
      return;
    }

    try {
      // استخدم endpoint الصحيح main_bar بدل main_categories
      const res = await fetch(`https://beeboard-production-b072.up.railway.app/api/main_bar/${projectId}`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });

      if (!res.ok) {
        console.error(`فشل في جلب الفئات الرئيسية: ${res.status}`);
        throw new Error(`فشل في جلب الفئات الرئيسية: ${res.status}`);
      }
      const json = await res.json();
      const categories = Array.isArray(json.data) ? json.data : [];
      console.log('Main categories fetched:', categories);

      renderMainCategories(categories);

      if (!categories || categories.length === 0) {
        clearMainCategoriesAndCards();
      } else {
        const firstCat = categories[0];
        const firstBtn = mainBarCategory.querySelector(`[data-category-id="${firstCat.id}"]`);
        if (firstBtn) {
          console.log('Automatically clicking first category button:', firstCat.name);
          firstBtn.click();
        } else {
          console.warn('زر الفئة الأولى غير موجود في DOM');
        }
      }

    } catch (err) {
      console.error('خطأ في loadMainCategories:', err);
      clearMainCategoriesAndCards();
    }
  }
function renderMainCategories(categories) {
  if (!mainBarCategory) return;

  mainBarCategory.innerHTML = '';

  if (!categories || categories.length === 0) {
    mainBarCategory.innerHTML = `
      <button class="main-bar-category-button active">
        <span class="main-bar-category-title">لا توجد فئات</span>
      </button>`;
    return;
  }

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'main-bar-category-button';
    btn.dataset.categoryId = cat.id;
    btn.dataset.categoryName = cat.name;
    btn.innerHTML = `<span class="main-bar-category-title">${safeText(cat.name)}</span>`;

    btn.addEventListener('click', () => {
      console.log('Main category clicked:', cat.name);
      mainBarCategory.querySelectorAll('.main-bar-category-button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      loadCardsForMainCategory(selectedProject?.project_id || selectedProject?.id, cat.id, cat.name);

      // تحميل الفئات الفرعية للفئة الرئيسية المحددة
      loadSubCategories(cat.id);
    });

    mainBarCategory.appendChild(btn);
  });
}
// جلب الفئات الفرعية لفئة رئيسية معينة
async function loadSubCategories(mainBarId) {
  if (!userToken || !mainBarId) {
    console.warn('لا يوجد توكن أو mainBarId لتحميل الفئات الفرعية');
    return;
  }

  try {
    const res = await fetch(`https://beeboard-production-b072.up.railway.app/api/sub_bar/${mainBarId}`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });

    if (!res.ok) {
      console.error(`فشل في جلب الفئات الفرعية: ${res.status}`);
      throw new Error(`فشل في جلب الفئات الفرعية: ${res.status}`);
    }

    const json = await res.json();
    const subCategories = Array.isArray(json.data) ? json.data : [];

    console.log('Sub categories fetched:', subCategories);
    renderSubCategories(subCategories);

  } catch (err) {
    console.error('خطأ في loadSubCategories:', err);
    renderSubCategories([]); // إظهار رسالة لا توجد فئات فرعية عند الخطأ
  }
}

// عرض الفئات الفرعية في القسم المخصص لها
function renderSubCategories(subCategories) {
  const subBarCategory = document.querySelector('.sub-bar-category');
  if (!subBarCategory) {
    console.warn('عنصر sub-bar-category غير موجود في الصفحة');
    return;
  }

  subBarCategory.innerHTML = ''; // تنظيف المحتوى الحالي

  if (!subCategories || subCategories.length === 0) {
    subBarCategory.innerHTML = `<div class="no-sub-categories">لا توجد فئات فرعية</div>`;
    return;
  }

  subCategories.forEach(subCat => {
    const div = document.createElement('div');
    div.className = 'sub-category-item';
    div.textContent = subCat.name || 'بدون اسم';
    // ممكن تضيف أحداث أخرى هنا عند الحاجة
    subBarCategory.appendChild(div);
  });
}



  function clearMainCategoriesAndCards() {
    console.log('Clearing main categories and cards');
    if (mainBarCategory) mainBarCategory.innerHTML = `
      <button class="main-bar-category-button active">
        <span class="main-bar-category-title">مهام</span>
      </button>`;
    clearCardsArea();
  }
  

  async function loadCardsForMainCategory(projectId, categoryId, categoryName) {
    console.log('Loading cards for category:', categoryName, { projectId, categoryId });
    if (!userToken || !projectId || !categoryId) {
      console.warn('Missing token or projectId or categoryId, clearing cards area');
      clearCardsArea();
      return;
    }

    try {
      const res = await fetch(`https://beeboard-production-b072.up.railway.app/api/card/${categoryId}/all`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });

      if (!res.ok) {
        console.error(`فشل في جلب البطاقات: ${res.status}`);
        throw new Error(`فشل في جلب البطاقات: ${res.status}`);
      }
      const json = await res.json();
      const cards = Array.isArray(json.data) ? json.data : [];
      console.log(`Cards fetched for category "${categoryName}":`, cards);

      renderCardsArea(cards, categoryName);
    } catch (err) {
      console.error('خطأ في loadCardsForMainCategory:', err);
      clearCardsArea();
    }
  }
  async function loadCardsForSubCategory(subBarId) {
  if (!userToken || !subBarId) {
    console.warn('لا يوجد توكن أو subBarId لتحميل البطاقات الفرعية');
    return;
  }

  try {
    const res = await fetch(`https://beeboard-production-b072.up.railway.app/api/card/${sub_bar_id}/all`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });

    if (!res.ok) {
      console.error(`فشل في جلب بطاقات الفئة الفرعية: ${res.status}`);
      throw new Error(`فشل في جلب بطاقات الفئة الفرعية: ${res.status}`);
    }

    const json = await res.json();
    const cards = Array.isArray(json.data) ? json.data : [];

    console.log(`Cards fetched for sub category ${subBarId}:`, cards);
    renderCardsForSubCategory(subBarId, cards);

  } catch (err) {
    console.error('خطأ في loadCardsForSubCategory:', err);
    renderCardsForSubCategory(subBarId, []); // عرض رسالة لا توجد بطاقات عند الخطأ
  }
}
// *** هذا هو الجزء المعدل بالكامل الخاص بزر الحفظ ***
  document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('popup-btn') && e.target.classList.contains('save')) {
        const nameInput = document.getElementById('main-category-name-input');
        if (!nameInput) {
          alert('حقل اسم الفئة الرئيسية غير موجود');
          return;
        }
        const name = nameInput.value.trim();

        if (!name) {
            alert('يرجى إدخال اسم الفئة الرئيسية');
            return;
        }

        if (!selectedProject) {
          alert('لم يتم تحديد مشروع لإنشاء الفئة الرئيسية.');
          return;
        }

        const projectId = selectedProject.project_id || selectedProject.id;
        if (!projectId) {
          alert('معرف المشروع غير موجود.');
          return;
        }

        fetch(`https://beeboard-production-b072.up.railway.app/api/main_bar/${projectId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ name })
        })
        .then(res => {
            if (!res.ok) throw new Error('فشل إنشاء الفئة الرئيسية');
            return res.json();
        })
        .then(data => {
            console.log('تم إنشاء الفئة:', data);
            hideCurrentPopup();
            loadMainCategories(projectId); // تحديث القائمة بعد الإضافة
        })
        .catch(err => {
            console.error(err);
            alert('حدث خطأ أثناء إنشاء الفئة الرئيسية');
        });
    }
  });
  // لما المستخدم يضغط على أي فئة رئيسية
document.addEventListener('click', function(e) {
  const mainCatBtn = e.target.closest('.main-bar-category-button');
  if (mainCatBtn) {
    selectedMainCategory = {
      id: mainCatBtn.getAttribute('data-category-id'),
      name: mainCatBtn.getAttribute('data-category-name')
    };
    console.log("✅ الفئة الرئيسية المختارة:", selectedMainCategory);
  }
});


  // ... باقي الكود كما هو ...
  document.addEventListener('click', function(e) {
  if (e.target && e.target.classList.contains('popup2-btn') && e.target.classList.contains('save')) {
    const nameInput = document.getElementById('sub-category-name-input');
    if (!nameInput) {
      alert('حقل اسم الفئة الفرعية غير موجود');
      return;
    }
    const name = nameInput.value.trim();

    if (!name) {
      alert('يرجى إدخال اسم الفئة الفرعية');
      return;
    }

    // تأكد أنك حددت الفئة الرئيسية
    if (!selectedMainCategory) {
      alert('لم يتم تحديد الفئة الرئيسية لإنشاء الفئة الفرعية.');
      return;
    }

    const main_bar_id = selectedMainCategory.id || selectedMainCategory.main_bar_id;
    if (!main_bar_id) {
      alert('معرف الفئة الرئيسية غير موجود.');
      return;
    }

    fetch(`https://beeboard-production-b072.up.railway.app/api/sub_bar/${main_bar_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ name })
    })
    .then(res => {
      if (!res.ok) throw new Error('فشل إنشاء الفئة الفرعية');
      return res.json();
    })
    .then(data => {
      console.log('تم إنشاء الفئة الفرعية:', data);
      hideCurrentPopup();
      loadSubCategories(main_bar_id); // جلب الفئات الفرعية بعد الإضافة
    })
    .catch(err => {
      console.error(err);
      alert('حدث خطأ أثناء إنشاء الفئة الفرعية');
    });
  }
});

  

function renderCardsForSubCategory(subBarId, cards) {
  const container = document.querySelector(`.title-card-container[data-sub-card-id="${subBarId}"]`);
  if (!container) {
    console.warn(`container for sub category id=${subBarId} غير موجود`);
    return;
  }

  const label = container.querySelector('.title-card-label');
  const count = container.querySelector('.title-card-count');
  const cardGrid = container.querySelector('.card-grid');

  if (!label || !count || !cardGrid) {
    console.warn('بعض عناصر العرض مفقودة في container');
    return;
  }

  // تحديث عدد البطاقات وعنوان الفئة الفرعية (لو تحتاج)
  label.textContent = cards.length > 0 ? cards[0].category_name || 'البطاقات' : 'البطاقات';
  count.textContent = cards.length;

  // تنظيف المحتوى القديم
  cardGrid.innerHTML = '';

  if (cards.length === 0) {
    cardGrid.innerHTML = `<div class="no-cards">لا توجد بطاقات</div>`;
    return;
  }

  // إضافة كل بطاقة
  cards.forEach(card => {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.innerHTML = `
      <div class="card-content">
        <div class="card-title">${safeText(card.title || card.name || 'بدون عنوان')}</div>
        <div class="card-desc" style="font-size:13px; color:#666;">${safeText(card.description || '')}</div>
      </div>
    `;
    cardGrid.appendChild(cardEl);
  });
}
function renderSubCategories(subCategories) {
  const subBarCategory = document.querySelector('.sub-bar-category');
  if (!subBarCategory) {
    console.warn('عنصر sub-bar-category غير موجود في الصفحة');
    return;
  }

  subBarCategory.innerHTML = '';

  if (!subCategories || subCategories.length === 0) {
    subBarCategory.innerHTML = `<div class="no-sub-categories">لا توجد فئات فرعية</div>`;
    return;
  }

  subCategories.forEach(subCat => {
    const div = document.createElement('div');
    div.className = 'sub-category-item';
    div.textContent = subCat.name || 'بدون اسم';

    div.addEventListener('click', () => {
      console.log('Sub category clicked:', subCat.name, subCat.id);
      loadCardsForSubCategory(subCat.id);
    });

    subBarCategory.appendChild(div);
  });
}


  


  function renderCardsArea(cards, categoryName = '') {
    console.log('Rendering cards area for category:', categoryName, 'عدد البطاقات:', cards.length);
    if (!mainContent) {
      console.warn('mainContent غير موجود');
      return;
    }

    const existing = mainContent.querySelectorAll('.title-card-container');
    existing.forEach(el => el.remove());

    const container = document.createElement('div');
    container.className = 'title-card-container';
    container.dataset.generatedForCategory = categoryName || '';

    const titleBar = document.createElement('div');
    titleBar.className = 'title-card-bar';
    titleBar.innerHTML = `
      <div class="title-card-right">
        <img src="imge/plus (1).svg" alt="Plus" class="add-btn create-card-btn" style="cursor:pointer;">
        <span class="title-card-label">${safeText(categoryName || 'البطاقات')}</span>
        <span class="title-card-count">${cards.length}</span>
      </div>
    `;
    container.appendChild(titleBar);

    const grid = document.createElement('div');
    grid.className = 'card-grid';
    grid.style.display = 'block';

    if (!cards || cards.length === 0) {
      grid.innerHTML = `<div class="no-cards">لا توجد بطاقات</div>`;
    } else {
      cards.forEach(card => {
        const c = document.createElement('div');
        c.className = 'card';
        c.innerHTML = `
          <div class="card-content">
            <div class="card-title">${safeText(card.title || card.name || 'بدون عنوان')}</div>
            <div class="card-desc" style="font-size:13px; color:#666;">${safeText(card.description || '')}</div>
          </div>
        `;
        grid.appendChild(c);
      });
    }

    container.appendChild(grid);
    mainContent.appendChild(container);
  }

  function clearCardsArea() {
    console.log('Clearing cards area');
    if (!mainContent) {
      console.warn('mainContent غير موجود');
      return;
    }
    const existing = mainContent.querySelectorAll('.title-card-container');
    if (existing.length === 0) {
      return;
    }
    existing.forEach(el => el.remove());

    const msg = document.createElement('div');
    msg.className = 'title-card-container';
    msg.innerHTML = `
      <div class="title-card-bar">
        <div class="title-card-right">
          <span class="title-card-label">لا توجد فئات</span>
        </div>
      </div>
      <div class="card-grid"><div class="no-cards">لا توجد بطاقات</div></div>
    `;
    mainContent.appendChild(msg);
  }

  function initArrowClick() {
    if (!arrowSection) {
      console.warn('arrowSection غير موجود');
      return;
    }

    arrowSection.addEventListener('click', async (e) => {
      e.stopPropagation();
      const isOpen = projectDropdown && projectDropdown.style.display === 'block';
      console.log('Arrow clicked, dropdown is open?', isOpen);
      if (isOpen) {
        closeProjectDropdown();
        return;
      }

      openProjectDropdown();

      if (!projectsLoaded) {
        console.log('Projects not loaded yet, fetching projects');
        await fetchProjects();
      }
    });

    document.addEventListener('click', (ev) => {
      const target = ev.target;
      if (!projectDropdown) return;
      if (!projectDropdown.contains(target) && !arrowSection.contains(target)) {
        console.log('Click outside dropdown and arrow, closing dropdown');
        closeProjectDropdown();
      }
    });
  }
  

  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    userToken = localStorage.getItem('beeboard_jwt_token') || null;
    console.log('Token loaded on DOMContentLoaded:', userToken);

    initArrowClick();

    if (!membersSectionTitle) console.warn('عنصر members-section title غير موجود في الصفحة');
    if (!mainBarCategory) console.warn('عنصر main-bar-category غير موجود في الصفحة');
  });
  

})();
