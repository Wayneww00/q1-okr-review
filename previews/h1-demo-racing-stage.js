(() => {
  const backgroundHref = new URL('assets/vantage-racing-stage-bg.png', window.location.href).href;
  const themeHref = new URL('h1-demo-racing-stage.css', window.location.href).href;

  const boards = [
    {
      id: 1,
      title: 'Retail 整体表现',
      displayTitle: 'RETAIL整体表现',
      englishTitle: 'OVERALL RETAIL PERFORMANCE',
      subtitle: '2026 H1 Retail FTD',
      description: 'Retail 整体 FTD 绝对值同比增长 27.8%，\n然而增速仍落后于大盘整体水平，大盘占比因此收窄 5.2%。',
      periodHeading: 'Half',
      metricLabel1: 'Retail FTD',
      metricLabel2: '集团占比',
      tableData: [
        { label: '2025 H2', absoluteText: '105,743', absolute: 105743, percentText: '37.8%', percent: 37.8 },
        { label: '2026 H1', absoluteText: '135,103', absolute: 135103, percentText: '32.6%', percent: 32.6 }
      ],
      kpis: [
        { label: '集团占比下降', value: '-5.2%', subtext: '37.8% → 32.6%' },
        { label: 'Retail FTD 绝对值', value: '+27.8%', subtext: '2026 H1 vs 2025 H2' }
      ],
      chart: {
        title: '2026 H1 Retail FTD 表现及整体占比变化',
        barLegend: 'Retail FTD（绝对值）',
        lineLegend: 'FTD 占 VANTAGE%（占比）',
        leftTicks: [0, 30000, 60000, 90000, 120000, 150000],
        format: 'number'
      }
    },
    {
      id: 2,
      title: 'Retail 整体表现',
      displayTitle: 'RETAIL整体表现',
      englishTitle: 'OVERALL RETAIL PERFORMANCE',
      subtitle: '2026 H1 Retail ND',
      description: 'Retail 整体 ND 绝对值同比增长 52.5%，\n大盘占比上升 0.9%。',
      periodHeading: 'Half',
      metricLabel1: 'Retail ND',
      metricLabel2: '集团占比',
      tableData: [
        { label: '2025 H2', absoluteText: '$145.4M', absolute: 145.4, percentText: '24.3%', percent: 24.3 },
        { label: '2026 H1', absoluteText: '$221.6M', absolute: 221.6, percentText: '25.2%', percent: 25.2 }
      ],
      kpis: [
        { label: '集团占比上升', value: '+0.9%', subtext: '24.3% → 25.2%' },
        { label: 'Retail ND 绝对值', value: '+52.5%', subtext: '2026 H1 vs 2025 H2' }
      ],
      chart: {
        title: '2026 H1 Retail ND 表现及整体占比变化',
        barLegend: 'Net Deposit（绝对值）',
        lineLegend: 'ND 占 VANTAGE%（占比）',
        leftTicks: [0, 50, 100, 150, 200, 250],
        format: 'currencyM'
      }
    },
    {
      id: 3,
      title: 'Retail 整体表现',
      displayTitle: 'RETAIL整体表现',
      englishTitle: 'OVERALL RETAIL PERFORMANCE',
      subtitle: '2026 H1 Retail TV',
      description: 'Retail 整体 TV 绝对值同比增长 39.8%，\n但增速仍明显落后于大盘整体水平，大盘占比因此收窄 0.8%。',
      periodHeading: 'Half',
      metricLabel1: 'Retail TV',
      metricLabel2: '集团占比',
      tableData: [
        { label: '2025 H2', absoluteText: '3,247.35 Bn', absolute: 3247.35, percentText: '23.9%', percent: 23.9 },
        { label: '2026 H1', absoluteText: '4,540.25 Bn', absolute: 4540.25, percentText: '23.1%', percent: 23.1 }
      ],
      kpis: [
        { label: '集团占比下降', value: '-0.8%', subtext: '23.9% → 23.1%' },
        { label: 'Retail TV 绝对值', value: '+39.8%', subtext: '2026 H1 vs 2025 H2' }
      ],
      chart: {
        title: '2026 H1 Retail TV 表现及整体占比变化',
        barLegend: 'Trading Volume（绝对值）',
        lineLegend: 'TV 占 VANTAGE%（占比）',
        leftTicks: [0, 1000, 2000, 3000, 4000, 5000],
        format: 'bn'
      }
    },
    {
      id: 4,
      title: 'Paid Ads 整体表现',
      displayTitle: 'PAID ADS整体表现',
      englishTitle: 'PAID MEDIA PERFORMANCE',
      subtitle: 'Paid Ads 2026 H1 FTD',
      description: 'Paid Ads FTD 绝对值同比增长 39.3%，\n但受 Q1 印度停投影响，大盘占比仍收窄 0.9%。',
      periodHeading: 'Half',
      metricLabel1: 'Paid Ads FTD',
      metricLabel2: '集团占比',
      tableData: [
        { label: '2025 H2', absoluteText: '39,650', absolute: 39650, percentText: '14.2%', percent: 14.2 },
        { label: '2026 H1', absoluteText: '55,226', absolute: 55226, percentText: '13.3%', percent: 13.3 }
      ],
      kpis: [
        { label: '集团占比下降', value: '-0.9%', subtext: '14.2% → 13.3%' },
        { label: 'Paid Ads FTD 绝对值', value: '+39.3%', subtext: '2026 H1 vs 2025 H2' }
      ],
      chart: {
        title: 'Paid Ads 2026 H1 FTD 表现及整体占比变化',
        barLegend: 'FTD（绝对值）',
        lineLegend: 'FTD 占 VANTAGE%（占比）',
        leftTicks: [0, 15000, 30000, 45000, 60000],
        format: 'number'
      }
    },
    {
      id: 5,
      title: 'Paid Ads 整体表现',
      displayTitle: 'PAID ADS整体表现',
      englishTitle: 'PAID MEDIA PERFORMANCE',
      subtitle: 'Paid Ads 2026 H1 ND',
      description: 'Paid Ads ND 绝对值同比增长 73.4%，\n大盘占比上涨 1.3%。',
      periodHeading: 'Half',
      metricLabel1: 'Paid Ads ND',
      metricLabel2: '集团占比',
      tableData: [
        { label: '2025 H2', absoluteText: '$42.5M', absolute: 42.5, percentText: '7.1%', percent: 7.1 },
        { label: '2026 H1', absoluteText: '$73.8M', absolute: 73.8, percentText: '8.4%', percent: 8.4 }
      ],
      kpis: [
        { label: '集团占比上升', value: '+1.3%', subtext: '7.1% → 8.4%' },
        { label: 'Paid Ads ND 绝对值', value: '+73.4%', subtext: '2026 H1 vs 2025 H2' }
      ],
      chart: {
        title: 'Paid Ads 2026 H1 ND 表现及整体占比变化',
        barLegend: 'Net Deposit（绝对值）',
        lineLegend: 'ND 占 VANTAGE%（占比）',
        leftTicks: [0, 20, 40, 60, 80],
        format: 'currencyM'
      }
    },
    {
      id: 6,
      title: 'Paid Ads 整体表现',
      displayTitle: 'PAID ADS整体表现',
      englishTitle: 'PAID MEDIA PERFORMANCE',
      subtitle: 'Paid Ads 2026 H1 TV',
      description: 'Paid Ads 整体 TV 绝对值同比增长 73.0%，\n增速略优于大盘整体水平，大盘占比提升 1.2%。',
      periodHeading: 'Half',
      metricLabel1: 'Paid Ads TV',
      metricLabel2: '集团占比',
      tableData: [
        { label: '2025 H2', absoluteText: '818.42 Bn', absolute: 818.42, percentText: '6.0%', percent: 6.0 },
        { label: '2026 H1', absoluteText: '1,415.59 Bn', absolute: 1415.59, percentText: '7.2%', percent: 7.2 }
      ],
      kpis: [
        { label: '集团占比上升', value: '+1.2%', subtext: '6.0% → 7.2%' },
        { label: 'Paid Ads TV 绝对值', value: '+73.0%', subtext: '2026 H1 vs 2025 H2' }
      ],
      chart: {
        title: 'Paid Ads 2026 H1 TV 表现及整体占比变化',
        barLegend: 'Trading Volume（绝对值）',
        lineLegend: 'TV 占 VANTAGE%（占比）',
        leftTicks: [0, 300, 600, 900, 1200, 1500],
        format: 'bn'
      }
    },
    {
      id: 7,
      type: 'profit',
      title: 'Paid Ads 整体表现',
      displayTitle: 'PAID ADS整体表现',
      englishTitle: 'PROFIT PERFORMANCE',
      subtitle: 'Paid Ads 2026 H1 利润',
      description: 'Paid Ads H1 利润同比增长 68.4%，\n月利润呈稳步上升趋势。',
      periodHeading: 'Half',
      metricLabel1: 'Paid Ads Profit',
      tableData: [
        { label: '2025 H2', absoluteText: '$37.4M', absolute: 37.4 },
        { label: '2026 H1', absoluteText: '$63.0M', absolute: 63.0 }
      ],
      monthlyData: [
        { label: 'Jan-26', absoluteText: '$10.33M', absolute: 10.33 },
        { label: 'Feb-26', absoluteText: '$10.01M', absolute: 10.01 },
        { label: 'Mar-26', absoluteText: '$13.23M', absolute: 13.23 },
        { label: 'Apr-26', absoluteText: '$9.89M', absolute: 9.89 },
        { label: 'May-26', absoluteText: '$7.61M', absolute: 7.61 },
        { label: 'Jun-26', absoluteText: '$11.93M', absolute: 11.93 }
      ],
      kpis: [
        { label: '同比增长', value: '+68.4%', subtext: '2026 H1 vs 2025 H2' },
        { label: '2026 H1 利润', value: '$63.0M', subtext: 'Paid Ads' }
      ],
      chart: {
        title: 'Paid Ads 2026 H1 月度利润',
        barLegend: 'Profit（绝对值）',
        leftTicks: [0, 5, 10, 15],
        format: 'currencyM'
      }
    },
    {
      id: 8,
      type: 'region',
      title: 'Paid Ads 地域表现',
      displayTitle: 'PAID ADS地域表现',
      englishTitle: 'REGIONAL PERFORMANCE',
      subtitle: 'Paid Ads 2026 H1 区域 ROI',
      description: 'Paid Ads H1 各区域 ROI 稳定增长，\n其中 APAC 的 ROI 将近翻倍。',
      periodHeading: 'Half',
      currentLabel: '2026 H1',
      metricLabel1: 'APAC ROI',
      tableData: [
        { label: '2025 H2', absoluteText: '5.6' },
        { label: '2026 H1', absoluteText: '10.7' }
      ],
      rows: [
        { quarter: '2025 H2', region: 'APAC', register: '255,848', ftd: '20,845', nd: '$10.69M', tv: '177.22 Bn', convCost: '$1.92M', roi: '5.6' },
        { quarter: '2025 H2', region: 'EU', register: '79,367', ftd: '12,917', nd: '$26.03M', tv: '524.68 Bn', convCost: '$4.41M', roi: '5.9' },
        { quarter: '2025 H2', region: 'LATAM', register: '46,440', ftd: '3,649', nd: '$1.30M', tv: '33.95 Bn', convCost: '$1.00M', roi: '1.3' },
        { quarter: '2025 H2', region: 'MENA', register: '50,628', ftd: '1,834', nd: '$2.84M', tv: '55.10 Bn', convCost: '$1.13M', roi: '2.5' },
        { quarter: '2026 H1', region: 'APAC', register: '314,795', ftd: '30,954', nd: '$23.65M', tv: '469.77 Bn', convCost: '$2.22M', roi: '10.7' },
        { quarter: '2026 H1', region: 'EU', register: '73,229', ftd: '16,846', nd: '$38.24M', tv: '770.59 Bn', convCost: '$4.88M', roi: '7.8' },
        { quarter: '2026 H1', region: 'LATAM', register: '62,701', ftd: '3,439', nd: '$2.35M', tv: '45.30 Bn', convCost: '$1.69M', roi: '1.4' },
        { quarter: '2026 H1', region: 'MENA', register: '41,644', ftd: '3,249', nd: '$7.43M', tv: '99.24 Bn', convCost: '$1.50M', roi: '5.0' }
      ],
      kpis: [
        { label: 'APAC ROI', value: '10.7', subtext: '5.6 → 10.7' },
        { label: 'MENA ROI', value: '5.0', subtext: '2.5 → 5.0' }
      ]
    },
    {
      id: 9,
      type: 'simple',
      title: 'SEO 数据',
      displayTitle: 'SEO曝光表现',
      englishTitle: 'MEDIA VISIBILITY',
      subtitle: 'SEO 日均曝光',
      description: 'SEO 日均曝光同比提升 22.5%。',
      periodHeading: 'Half',
      metricLabel1: '日均曝光',
      tableData: [
        { label: '2025 H2', absoluteText: '338K', absolute: 338000 },
        { label: '2026 H1', absoluteText: '414K', absolute: 414000 }
      ],
      kpis: [
        { label: '同比增长', value: '+22.5%', subtext: '2026 H1 vs 2025 H2' },
        { label: '2026 H1 日均曝光', value: '414K', subtext: 'SEO' }
      ],
      chart: {
        title: 'SEO 日均曝光',
        barLegend: '日均曝光',
        leftTicks: [0, 100000, 200000, 300000, 400000, 500000],
        format: 'number'
      }
    },
    {
      id: 10,
      type: 'simple',
      title: 'SEO 数据',
      displayTitle: 'SEO点击表现',
      englishTitle: 'ENGAGEMENT PERFORMANCE',
      subtitle: 'SEO 日均点击',
      description: 'SEO 日均点击同比提升 28.7%。',
      periodHeading: 'Half',
      metricLabel1: '日均点击',
      tableData: [
        { label: '2025 H2', absoluteText: '10,571', absolute: 10571 },
        { label: '2026 H1', absoluteText: '13,609', absolute: 13609 }
      ],
      kpis: [
        { label: '同比增长', value: '+28.7%', subtext: '2026 H1 vs 2025 H2' },
        { label: '2026 H1 日均点击', value: '13,609', subtext: 'SEO' }
      ],
      chart: {
        title: 'SEO 日均点击',
        barLegend: '日均点击',
        leftTicks: [0, 5000, 10000, 15000],
        format: 'number'
      }
    }
  ];

  const escapeHtml = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const formatTick = (value, format) => {
    if (value === 0) return '0';
    if (format === 'currencyM') return `$${value}M`;
    if (format === 'currencyBn') return `$${Number(value).toLocaleString()} Bn`;
    if (format === 'bn') return `${Number(value).toLocaleString()} Bn`;
    if (value >= 1000000) {
      const compact = value / 1000000;
      return `${Number.isInteger(compact) ? compact : compact.toFixed(1)}M`;
    }
    if (value >= 1000) return `${Math.round(value / 1000)}K`;
    return Number(value).toLocaleString();
  };

  const checkerMarkup = () =>
    `<span class="race-checkers" aria-hidden="true">${Array.from({ length: 10 }, () => '<i></i>').join('')}</span>`;

  const renderMiniTable = board => {
    const hasPercent = board.tableData.some(row => row.percentText);
    const metricHeading = board.metricLabel1 || 'ROI';
    return `
      <table class="race-mini-table" aria-label="${escapeHtml(board.subtitle)} 数据对比">
        <thead>
          <tr>
            <th><span>${escapeHtml(board.periodHeading || 'Quarter')}</span></th>
            <th><span>${escapeHtml(metricHeading)}</span></th>
            ${hasPercent ? `<th><span>${escapeHtml(board.metricLabel2)}</span></th>` : ''}
          </tr>
        </thead>
        <tbody>
          ${board.tableData.map(row => `
            <tr>
              <td>${escapeHtml(row.label)}</td>
              <td>${escapeHtml(row.absoluteText)}</td>
              ${hasPercent ? `<td>${escapeHtml(row.percentText)}</td>` : ''}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  };

  const renderInfoBand = board => `
    <section class="race-info-band">
      <div class="race-summary">
        <div class="race-summary-heading">
          ${checkerMarkup()}
          <span>${escapeHtml(board.subtitle)}</span>
        </div>
        <p>${escapeHtml(board.description)}</p>
      </div>
      ${renderMiniTable(board)}
    </section>
  `;

  const renderKpiCard = kpi => `
    <article class="race-kpi-card">
      <div class="race-kpi-tag">${escapeHtml(kpi.label)}</div>
      <div class="race-kpi-value">${escapeHtml(kpi.value)}</div>
      <div class="race-kpi-sub">${escapeHtml(kpi.subtext)}</div>
    </article>
  `;

  const renderChart = (board, rows) => {
    const width = 900;
    const height = 300;
    const left = 88;
    const right = board.type === 'simple' || board.type === 'profit' ? 28 : 76;
    const top = 34;
    const baseline = 252;
    const plotHeight = baseline - top;
    const plotWidth = width - left - right;
    const maxValue = Math.max(...board.chart.leftTicks);
    const count = rows.length;
    const barWidth = count > 4 ? 54 : 88;
    const xAt = index => left + ((index + .5) / count) * plotWidth;
    const yFor = value => baseline - (value / maxValue) * plotHeight;

    const grid = board.chart.leftTicks.map(tick => {
      const y = yFor(tick);
      return `
        <line x1="${left}" y1="${y}" x2="${width - right}" y2="${y}" stroke="rgba(255,255,255,.2)" stroke-dasharray="5 7" />
        <text x="${left - 13}" y="${y + 4}" text-anchor="end" fill="rgba(255,255,255,.72)" font-size="11">${escapeHtml(formatTick(tick, board.chart.format))}</text>
      `;
    }).join('');

    const bars = rows.map((row, index) => {
      const x = xAt(index);
      const y = yFor(row.absolute);
      const h = Math.max(0, baseline - y);
      return `
        <g>
          <rect class="race-bar" x="${x - barWidth / 2}" y="${y}" width="${barWidth}" height="${h}" rx="7" fill="url(#raceBar-${board.id})" />
          <text x="${x}" y="${Math.max(18, y - 11)}" text-anchor="middle" fill="#fff" font-size="${count > 4 ? 10 : 13}" font-weight="600">${escapeHtml(row.absoluteText)}</text>
          <text x="${x}" y="${baseline + 29}" text-anchor="middle" fill="rgba(255,255,255,.8)" font-size="${count > 4 ? 10 : 12}">${escapeHtml(row.label)}</text>
        </g>
      `;
    }).join('');

    let percentLayer = '';
    if (rows.every(row => Number.isFinite(row.percent))) {
      const percentMax = Math.max(50, Math.ceil(Math.max(...rows.map(row => row.percent)) / 10) * 10);
      const percentY = value => baseline - (value / percentMax) * plotHeight;
      const points = rows.map((row, index) => `${xAt(index)},${percentY(row.percent)}`).join(' ');
      const rightTicks = [0, percentMax / 3, percentMax * 2 / 3, percentMax];
      percentLayer = `
        ${rightTicks.map(tick => `
          <text x="${width - right + 14}" y="${percentY(tick) + 4}" fill="rgba(255,255,255,.72)" font-size="11">${Number(tick.toFixed(1))}%</text>
        `).join('')}
        <polyline class="race-line" points="${points}" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="5 6" />
        ${rows.map((row, index) => {
          const x = xAt(index);
          const y = percentY(row.percent);
          return `
            <g class="race-point">
              <circle cx="${x}" cy="${y}" r="7" fill="#c4122f" stroke="#fff" stroke-width="3" />
              <rect x="${x - 27}" y="${y - 39}" width="54" height="25" rx="3" fill="rgba(74,18,24,.96)" />
              <text x="${x}" y="${y - 22}" text-anchor="middle" fill="#fff" font-size="11" font-weight="600">${escapeHtml(row.percentText)}</text>
            </g>
          `;
        }).join('')}
      `;
    }

    return `
      <svg class="race-chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(board.chart.title)}">
        <defs>
          <linearGradient id="raceBar-${board.id}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ff6a13" />
            <stop offset="48%" stop-color="#e33a0b" />
            <stop offset="100%" stop-color="#6d1b09" />
          </linearGradient>
          <filter id="raceBarGlow-${board.id}" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        ${grid}
        <line x1="${left}" y1="${baseline}" x2="${width - right}" y2="${baseline}" stroke="rgba(255,255,255,.55)" />
        ${bars}
        ${percentLayer}
      </svg>
    `;
  };

  const renderChartCard = board => {
    const chartRows = board.type === 'profit' ? board.monthlyData : board.tableData;
    return `
      <article class="race-chart-card">
        <div class="race-chart-title">${escapeHtml(board.chart.title)}</div>
        <div class="race-chart-legend">
          <span class="race-legend-item"><i class="race-legend-bar"></i>${escapeHtml(board.chart.barLegend)}</span>
          ${board.chart.lineLegend ? `<span class="race-legend-item"><i class="race-legend-line"></i>${escapeHtml(board.chart.lineLegend)}</span>` : ''}
        </div>
        ${renderChart(board, chartRows)}
      </article>
    `;
  };

  const renderRegionTable = board => `
    <article class="race-chart-card">
      <div class="race-chart-title">2026 H1 各区域表现与 ROI 对比</div>
      <div class="race-region-table-wrap">
        <table class="race-region-table" aria-label="Paid Ads 地域数据">
          <thead>
            <tr>
              <th>Half</th>
              <th>Region</th>
              <th>Register</th>
              <th>FTD</th>
              <th>Net Deposit</th>
              <th>Trading Volume</th>
              <th>Conv. Cost</th>
              <th>ROI</th>
            </tr>
          </thead>
          <tbody>
            ${board.rows.map(row => `
              <tr class="${row.quarter === board.currentLabel ? 'current' : ''}">
                <td>${escapeHtml(row.quarter)}</td>
                <td>${escapeHtml(row.region)}</td>
                <td>${escapeHtml(row.register)}</td>
                <td>${escapeHtml(row.ftd)}</td>
                <td>${escapeHtml(row.nd)}</td>
                <td>${escapeHtml(row.tv)}</td>
                <td>${escapeHtml(row.convCost)}</td>
                <td>${escapeHtml(row.roi)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </article>
  `;

  const renderBoard = (board, total) => {
    const pageClass = [
      'race-stage-page',
      board.type === 'region' ? 'is-region' : '',
      board.type === 'profit' ? 'is-profit' : ''
    ].filter(Boolean).join(' ');
    const mainVisual = board.type === 'region' ? renderRegionTable(board) : renderChartCard(board);

    return `
      <section class="${pageClass}" data-racing-board="${board.id}" aria-label="${escapeHtml(board.title)}">
        ${renderInfoBand(board)}
        <div class="race-lower">
          ${mainVisual}
          <aside class="race-kpi-stack" aria-label="关键指标">
            ${board.kpis.map(renderKpiCard).join('')}
          </aside>
        </div>
        <div class="race-page-count">${String(board.id).padStart(2, '0')} / ${String(total).padStart(2, '0')}</div>
      </section>
    `;
  };

  const injectReport = reportDoc => {
    if (!reportDoc?.body?.classList.contains('h1-embedded-report')) return false;
    const pages = [...reportDoc.querySelectorAll('.dash-page')];
    if (pages.length !== boards.length) return false;

    reportDoc.documentElement.classList.add('h1-demo-racing-stage-report');
    reportDoc.body.classList.add('h1-demo-racing-stage-report');

    const chapters = [...reportDoc.querySelectorAll('.h1-report-chapter')];
    const performanceChapter = chapters[0];
    if (performanceChapter) {
      performanceChapter.classList.add('race-stage-chapter');
      const kicker = performanceChapter.querySelector('.h1-report-kicker');
      const title = performanceChapter.querySelector('.h1-report-title');
      if (kicker) kicker.textContent = 'Overall Performance';
      if (title) {
        const count = title.querySelector('small');
        title.textContent = '整体表现';
        if (count) title.appendChild(count);
      }
    }

    const dashboardWrap = pages[0]?.parentElement?.parentElement;
    dashboardWrap?.classList.add('race-stage-dashboard');

    let fixedBackground = reportDoc.querySelector('.race-fixed-bg');
    if (!fixedBackground) {
      fixedBackground = reportDoc.createElement('div');
      fixedBackground.className = 'race-fixed-bg';
      fixedBackground.innerHTML = `<img src="${backgroundHref}" alt="" aria-hidden="true" />`;
      reportDoc.body.prepend(fixedBackground);
    }

    if (performanceChapter && dashboardWrap && reportDoc.body.dataset.racingBackgroundBound !== 'true') {
      reportDoc.body.dataset.racingBackgroundBound = 'true';
      const reportWindow = reportDoc.defaultView;
      const syncFixedBackground = () => {
        const chapterRect = performanceChapter.getBoundingClientRect();
        const dashboardRect = dashboardWrap.getBoundingClientRect();
        const visible = chapterRect.bottom > 72 && dashboardRect.bottom > 72 && chapterRect.top < reportWindow.innerHeight;
        fixedBackground.classList.toggle('is-visible', visible);
      };
      reportDoc.addEventListener('scroll', syncFixedBackground, { passive: true });
      reportWindow.addEventListener('resize', syncFixedBackground);
      reportWindow.requestAnimationFrame(syncFixedBackground);
    }

    if (!reportDoc.getElementById('h1-demo-racing-stage-theme')) {
      const link = reportDoc.createElement('link');
      link.id = 'h1-demo-racing-stage-theme';
      link.rel = 'stylesheet';
      link.href = themeHref;
      reportDoc.head.appendChild(link);
    }

    pages.forEach((page, index) => {
      if (page.querySelector(':scope > .race-stage-page')) return;
      page.insertAdjacentHTML('beforeend', renderBoard(boards[index], boards.length));
    });

    reportDoc.body.dataset.racingStageReady = 'true';
    return true;
  };

  const setup = () => {
    const shellFrame = document.querySelector('[data-demo-frame]');
    const shellDoc = shellFrame?.contentDocument;
    const reportFrame = shellDoc?.querySelector('#reportFrame');
    const reportDoc = reportFrame?.contentDocument;
    return injectReport(reportDoc);
  };

  const shellFrame = document.querySelector('[data-demo-frame]');
  shellFrame?.addEventListener('load', () => {
    const reportFrame = shellFrame.contentDocument?.querySelector('#reportFrame');
    reportFrame?.addEventListener('load', () => {
      let attempts = 0;
      const timer = window.setInterval(() => {
        attempts += 1;
        if (setup() || attempts > 120) window.clearInterval(timer);
      }, 150);
    });
  });

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    const ready = setup();
    if ((ready && attempts > 30) || attempts > 160) window.clearInterval(timer);
  }, 150);
})();
