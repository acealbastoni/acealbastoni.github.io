// app.js — v3.1 (موعد أكتروس ديناميكي)
'use strict';
(function(){
  const showError = (msg)=>{
    try{
      const el = document.getElementById('errorBanner');
      if(el){ el.textContent = 'خطأ بالصفحة: ' + msg; el.style.display='block'; }
      console.error('App error:', msg);
    }catch(_){}
  };

  const ready = ()=>{
    try{
      const $ = (id) => document.getElementById(id);
      const nf = (v) => new Intl.NumberFormat('ar-EG').format(Math.round(+v || 0));

      const q = (sel)=>document.querySelector(sel);
      const qa = (sel)=>Array.from(document.querySelectorAll(sel));

      const els = {
        salary: $('salary'), spend:$('spend'), currentBalance:$('currentBalance'), emergency:$('emergency'),
        roscaPay:$('roscaPay'), roscaN:$('roscaN'), roscaOrder:$('roscaOrder'),
        rentYear:$('rentYear'), rentOption:$('rentOption'),
        truckEGP:$('truckEGP'), truckDue:$('truckDue'), truckGraceDays:$('truckGraceDays'),
        fx:$('fx'), monthlyEGP:$('monthlyEGP'), useEGP:$('useEGP'),
        ccLimit:$('ccLimit'), stmtDay:$('stmtDay'), grace:$('grace'), ccFeePerK:$('ccFeePerK'),
        octSalaryEnd:$('octSalaryEnd'), priority:$('priority'),
        calc:$('calc'), reset:$('reset')
      };

      if(!els.calc || !els.reset){ showError('تعذّر إيجاد أزرار التشغيل. تأكّد أن app.js تم تحميله.'); return; }

      function safeNum(v){ const n = parseFloat(v); return isFinite(n) ? n : 0; }
      function monthName(d){ return d.toLocaleDateString('ar-EG',{month:'long',year:'numeric'}); }
      function addMonths(d, m){ const x=new Date(d); x.setMonth(x.getMonth()+m); return x; }
      function fmtDate(d){ return new Date(d).toLocaleDateString('ar-EG'); }
      function firstOfMonth(d){ const x=new Date(d); x.setDate(1); x.setHours(0,0,0,0); return x; }
      function monthsBetween(a,b){ // فرق الأشهر بين تاريخين (على أول الشهر)
        const A = firstOfMonth(a), B = firstOfMonth(b);
        return (B.getFullYear()-A.getFullYear())*12 + (B.getMonth()-A.getMonth());
      }

      function drawLine(id, data, title){
        const c = document.getElementById(id); if(!c) return;
        const ctx = c.getContext('2d');
        const DPR=Math.max(1,window.devicePixelRatio||1), cssW=c.clientWidth||900, cssH=c.height; c.width=cssW*DPR; c.height=cssH*DPR; ctx.scale(DPR,DPR);
        const padL=60,padR=20,padT=38,padB=38; const W=cssW,H=cssH,left=padL,right=W-padR,top=padT,bottom=H-padB,w=right-left,h=bottom-top;
        ctx.clearRect(0,0,W,H); ctx.fillStyle='#e5e7eb'; ctx.font='600 15px system-ui'; ctx.fillText(title,left,top-12);
        let minY=Math.min(...data,0), maxY=Math.max(...data,1);
        ctx.strokeStyle='#334155'; ctx.beginPath(); ctx.moveTo(left,bottom); ctx.lineTo(right,bottom); ctx.stroke(); ctx.beginPath(); ctx.moveTo(left,top); ctx.lineTo(left,bottom); ctx.stroke();
        ctx.font='12px system-ui'; ctx.fillStyle='#9ca3af'; const yTicks=6;
        for(let i=0;i<=yTicks;i++){const t=i/yTicks; const y=bottom-t*h; const val=minY+t*(maxY-minY); ctx.strokeStyle='#1f2937'; ctx.beginPath(); ctx.moveTo(left,y); ctx.lineTo(right,y); ctx.stroke(); ctx.fillText(nf(val),8,y+4);}
        const len=data.length, step=Math.max(1,Math.floor(len/10));
        for(let i=0;i<len;i+=step){const x=left+(i/(Math.max(1,len-1)))*w; ctx.fillText((i+1).toString(),x-6,bottom+16);}
        ctx.strokeStyle='#60a5fa'; ctx.lineWidth=2.5; ctx.beginPath();
        data.forEach((v,i)=>{const x=left+(i/(Math.max(1,len-1)))*w; const y=bottom-((v-minY)/(maxY-minY))*h; if(i===0)ctx.moveTo(x,y); else ctx.lineTo(x,y);});
        ctx.stroke();
      }

      function drawBars(id, bars, title){
        const c=document.getElementById(id); if(!c) return;
        const ctx=c.getContext('2d');
        const DPR=Math.max(1,window.devicePixelRatio||1), cssW=c.clientWidth||900, cssH=c.height; c.width=cssW*DPR; c.height=cssH*DPR; ctx.scale(DPR,DPR);
        const padL=60,padR=20,padT=38,padB=38; const W=cssW,H=cssH,left=padL,right=W-padR,top=padT,bottom=H-padB,w=right-left,h=bottom-top;
        ctx.clearRect(0,0,W,H); ctx.fillStyle='#e5e7eb'; ctx.font='600 15px system-ui'; ctx.fillText(title,left,top-12);
        const maxY=Math.max(1,...bars), minY=0;
        ctx.strokeStyle='#334155'; ctx.beginPath(); ctx.moveTo(left,bottom); ctx.lineTo(right,bottom); ctx.stroke(); ctx.beginPath(); ctx.moveTo(left,top); ctx.lineTo(left,bottom); ctx.stroke();
        ctx.font='12px system-ui'; ctx.fillStyle='#9ca3af'; const yTicks=6;
        for(let i=0;i<=yTicks;i++){const t=i/yTicks; const y=bottom-t*h; const val=minY+t*(maxY-minY); ctx.strokeStyle='#1f2937'; ctx.beginPath(); ctx.moveTo(left,y); ctx.lineTo(right,y); ctx.stroke(); ctx.fillText(nf(val),8,y+4);}
        const len=bars.length, step=Math.max(1,Math.floor(len/10));
        for(let i=0;i<len;i+=step){const x=left+(i/(Math.max(1,len-1)))*w; ctx.fillText((i+1).toString(),x-6,bottom+16);}
        const barW=Math.max(4, w/Math.max(12,len)*0.6); ctx.fillStyle='#22c55e';
        bars.forEach((v,i)=>{const x=left+(i/(Math.max(1,len-1)))*w-barW/2; const y=bottom-((v-minY)/(maxY-minY))*h; ctx.fillRect(x,y,barW,bottom-y);});
      }

      function compute(){
        try{
          // Inputs
          const salary=+els.salary.value||0, spend=+els.spend.value||0,
                cur=+els.currentBalance.value||0, emer=+els.emergency.value||0;
          const roscaPay=+els.roscaPay.value||0, roscaN=+els.roscaN.value||0, roscaOrder=(+els.roscaOrder.value||1);
          const rentYear=+els.rentYear.value||0, rentMonths=+(els.rentOption.value||12);
          const truckEGP=+els.truckEGP.value||0, fx=+els.fx.value||0, ccLimit=+els.ccLimit.value||0, feePerK=(+els.ccFeePerK.value||39);
          const monthlyEGP=+els.monthlyEGP.value||0, useEGP = els.useEGP.value==='yes';
          const rentAmt = rentMonths===12 ? rentYear : Math.round(rentYear/12*6);

          const truckDue = new Date(els.truckDue.value);
          const truckLast = new Date(truckDue); truckLast.setDate(truckLast.getDate()+(+els.truckGraceDays.value||0));
          const octPaidAtEnd = els.octSalaryEnd.value==='yes';
          const priority = els.priority.value; // 'sar-first' | 'egp-first'
          const stmtDay = parseInt(els.stmtDay.value,10) || 7;

          // نافذة التخطيط ثابتة (أكتوبر→فبراير) كما في الصفحة
          const start = new Date('2025-10-01');
          const monthsIdx = [0,1,2,3,4];
          const labels = monthsIdx.map(i=> monthName(addMonths(start,i)));

          // حدد شهر السداد بحسب truckDue
          const truckMonthIdx = monthsBetween(start, truckDue); // 0..4 داخل النافذة
          if (truckMonthIdx < 0 || truckMonthIdx > 4){
            showError('تاريخ سداد الأكتروس خارج نطاق الجدول (أكتوبر 2025 → فبراير 2026). غيّر التاريخ أو وسّع الجدول.');
          }

          let cash = cur;
          const rows = [];
          const supportSARByMonth = (fx>0 && useEGP) ? Math.floor(monthlyEGP / fx) : 0;
          const receiveMap = {1:0,2:1,3:2,4:3,5:4};

          // املأ التدفقات الشهرية الأساسية
          monthsIdx.forEach(mi=>{
            const row = { label: labels[mi], start: cash, salary:0, support:0, roscaPay:0, spend:0, truck:0, roscaIn:0, rent:0, ccDraw:0, ccRepay:0, end:0, warn:'' };

            if (mi===0){
              row.salary = octPaidAtEnd ? salary : 0; cash += row.salary;
              row.spend = spend; cash -= row.spend;
            } else {
              row.salary = (mi===1 && octPaidAtEnd) ? 0 : salary; cash += row.salary;
              if (supportSARByMonth>0){ row.support = supportSARByMonth; cash += row.support; }
              row.roscaPay = roscaPay; cash -= row.roscaPay;
              row.spend = spend; cash -= row.spend;
            }

            // قبض الجمعية حسب الترتيب
            if (mi===receiveMap[roscaOrder]){ row.roscaIn = roscaPay*roscaN; cash += row.roscaIn; }
            // الإيجار ما زال مضبوطًا على ديسمبر (mi===2) كما في الصفحة
            if (mi===2){ row.rent = rentAmt; cash -= row.rent; }

            rows.push(row);
          });

          // متطلبات الأكتروس (بالريال)
          const requiredSAR = fx>0 ? Math.ceil(truckEGP / fx) : 0;

          // الشهر المستهدف لسداد الأكتروس
          const tr = (truckMonthIdx>=0 && truckMonthIdx<=4) ? rows[truckMonthIdx] : null;

          let remainingForTruck = requiredSAR;
          if (tr){
            const trSalaryAvail = Math.max(0, tr.start + tr.salary - tr.roscaPay - tr.spend - emer);
            const trSupportAvail = Math.max(0, tr.support);

            let fromSupport = 0, fromSalary = 0;
            if (priority==='egp-first'){
              fromSupport = Math.min(remainingForTruck, trSupportAvail);
              fromSalary = Math.min(remainingForTruck - fromSupport, trSalaryAvail);
            } else {
              fromSalary = Math.min(remainingForTruck, trSalaryAvail);
              fromSupport = Math.min(remainingForTruck - fromSalary, trSupportAvail);
            }
            tr.truck = fromSupport + fromSalary;
            remainingForTruck = Math.max(0, remainingForTruck - tr.truck);
          }

          // اقتراح سحب بطاقة في شهر السداد، بحيث يُسدَّد في الشهر التالي قدر الإمكان
          if (tr && remainingForTruck>0){
            const next1Idx = truckMonthIdx+1;
            const next1 = rows[next1Idx];

            // تقدير تاريخ السحب المقترح: اليوم التالي ليوم كشف الحساب في شهر الاستحقاق
            const drawDate = new Date(truckDue);
            if (drawDate.getDate() <= stmtDay) drawDate.setDate(stmtDay+1);

            // تقدير القدرة على السداد في الشهر التالي (قبل الحفاظ على الطوارئ)
            const next1StartIfNoCC = tr.start + tr.salary + tr.support + tr.roscaIn - tr.roscaPay - tr.spend - tr.rent - tr.truck;
            let next1BeforeEnd = next1
              ? (next1StartIfNoCC + next1.salary + next1.support + next1.roscaIn - next1.roscaPay - next1.spend - next1.rent)
              : next1StartIfNoCC; // لو مافيش شهر تالٍ داخل الجدول
            const repayCapacityNext1 = Math.max(0, next1BeforeEnd - emer);

            const ccDrawHere = Math.min(ccLimit, remainingForTruck, Math.floor(repayCapacityNext1/1000)*1000);
            tr.ccDraw = ccDrawHere;
            remainingForTruck -= ccDrawHere;

            if (remainingForTruck>0){
              tr.warn = '⚠️ لا يكفي لسداد أكتروس بالكامل — زد دعم مصر أو قلّل مصروف هذا الشهر مؤقتًا';
            }
          }

          // احسب الأرصدة بالتسلسل، مع سداد البطاقة ابتداء من الشهر الذي يلي السحب
          // (نستخدم معادلة عامة لجمع/طرح التدفقات لكل شهر)
          const sumFlowsNoRepay = (r)=> (r.start + r.salary + r.support + r.roscaIn - r.roscaPay - r.spend - r.rent - r.truck + r.ccDraw);

          // الشهر 0
          rows[0].end = sumFlowsNoRepay(rows[0]);
          if (rows[0].end < emer) rows[0].warn = '❗ أقل من احتياطي الطوارئ';

          // بقية الأشهر + سداد البطاقة
          let ccBal = tr ? (tr.ccDraw||0) : 0;
          for (let i=1;i<rows.length;i++){
            rows[i].start = rows[i-1].end;
            let endNoRepay = sumFlowsNoRepay(rows[i]);
            // سداد البطاقة يبدأ من الشهر التالي لسحبها
            if (ccBal>0 && tr && i > truckMonthIdx){
              const repay = Math.min(ccBal, Math.max(0, endNoRepay - emer));
              rows[i].ccRepay = repay;
              endNoRepay -= repay;
              ccBal -= repay;
            }
            rows[i].end = endNoRepay;
            if (rows[i].end < emer) rows[i].warn = '❗ أقل من احتياطي الطوارئ';
          }

          // عناصر الملخص
          const [oct, nov, dec, jan, feb] = rows; // تبقى التسميات كما في الجدول الحالي
          const balOct = document.getElementById('balOct');
          const truckPaySAR = document.getElementById('truckPaySAR');
          const ccDrawNovEl = document.getElementById('ccDrawNov');
          const roscaIn = document.getElementById('roscaIn');
          const rentOut = document.getElementById('rentOut');
          const ccCost = document.getElementById('ccCost');
          const advice = document.getElementById('advice');

          [balOct, truckPaySAR, ccDrawNovEl, roscaIn, rentOut, ccCost, advice].forEach(el=>{ if(!el){ showError('بعض عناصر الملخص مفقودة.'); } });

          if(balOct) balOct.textContent = nf(rows[0].end) + ' ر.س';

          // ملخص سداد الأكتروس (استخدم شهر السداد الفعلي)
          if (truckPaySAR){
            const trSum = tr ? ((tr.truck||0) + (tr.ccDraw||0)) : 0;
            const rangeTxt = tr ? `(${fmtDate(truckDue)} → ${fmtDate(truckLast)})` : '';
            truckPaySAR.textContent = nf(trSum) + ' ر.س ' + rangeTxt;
          }

          if(ccDrawNovEl){
            const drawVal = tr ? (tr.ccDraw||0) : 0;
            ccDrawNovEl.textContent = nf(drawVal) + ' ر.س';
          }

          if(roscaIn) roscaIn.textContent = nf((rows[2]?.roscaIn)||0) + ' ر.س (1 ديسمبر)';
          if(rentOut) rentOut.textContent = nf((rows[2]?.rent)||0) + ' ر.س (1 ديسمبر)';

          // تكلفة محتملة بعد السماح (لو تبقّى رصيد على البطاقة)
          const residualCC = Math.max(0, (tr?.ccDraw||0) - (rows[2]?.ccRepay||0) - (rows[3]?.ccRepay||0));
          const potentialCost = residualCC>0 ? Math.round((residualCC/1000)*(+els.ccFeePerK.value||39)) : 0;
          if(ccCost) ccCost.textContent = residualCC>0 ? (nf(potentialCost) + ' ر.س لكل دورة بعد السماح') : '—';

          // نصائح مبسطة (استخدم تاريخ الأكتروس الديناميكي)
          const steps = [
            `• من ${fmtDate(truckDue)} إلى ${fmtDate(truckLast)}: سداد أكتروس ≈ <b>${nf(requiredSAR)}</b> ر.س — نقدًا: <b>${nf(tr?.truck||0)}</b> ر.س، والباقي بطاقة: <b>${nf(tr?.ccDraw||0)}</b> ر.س (فضّل السحب بعد يوم كشف الحساب).`,
            `• الشهر التالي: سدّد من البطاقة قدر الإمكان دون كسر احتياطي الطوارئ.`,
            `• الشهر الذي يليه: سدّد أي متبقٍ إن وجد.`
          ];
          if(advice) advice.innerHTML = `<div class="checklist">${steps.join('<br>')}</div>`;

          // توليد الجدول
          const tbody = document.querySelector('#tbl tbody');
          if(!tbody){ showError('لم يتم العثور على tbody للجدول.'); return; }
          tbody.innerHTML = rows.map(r => `
            <tr>
              <td>${r.label}</td>
              <td>${nf(r.start)}</td>
              <td>${r.salary?nf(r.salary):'—'}</td>
              <td class="ok">${r.support?nf(r.support):'—'}</td>
              <td class="warn">${r.roscaPay?nf(r.roscaPay):'—'}</td>
              <td class="warn">${r.spend?nf(r.spend):'—'}</td>
              <td class="warn">${r.truck?nf(r.truck):'—'}</td>
              <td class="ok">${r.roscaIn?nf(r.roscaIn):'—'}</td>
              <td class="warn">${r.rent?nf(r.rent):'—'}</td>
              <td class="ok">${r.ccDraw?nf(r.ccDraw):'—'}</td>
              <td class="warn">${r.ccRepay?nf(r.ccRepay):'—'}</td>
              <td><b>${nf(r.end)}</b></td>
              <td>${r.warn||'—'}</td>
            </tr>
          `).join('');

          // الرسوم البيانية
          drawLine('chartBal', rows.map(r=>r.end), 'تطور رصيدك النقدي (نهاية كل شهر)');
          drawBars('chartCC', rows.map(r=>r.ccDraw||0), 'سحوبات البطاقة (شهريًا)');
          drawBars('chartEGP', rows.map(r=>r.support||0), 'الدعم المصري المحوّل إلى SAR (شهريًا)');
        }catch(err){
          showError(err && err.message ? err.message : String(err));
        }
      }

      // Events
      els.calc.addEventListener('click', compute);
      els.reset.addEventListener('click', ()=> window.location.reload());
      qa('.tab').forEach(btn=>{
        btn.addEventListener('click',()=>{
          qa('.tab').forEach(b=>b.classList.remove('active'));
          btn.classList.add('active');
          qa('.pane').forEach(p=>p.classList.remove('active'));
          const pane = document.getElementById('pane-'+btn.dataset.key);
          if(pane) pane.classList.add('active');
        });
      });

      // Initial compute
      compute();
      console.log('Cash planner loaded v3.1 (dynamic truck due)');
    }catch(e){
      showError(e && e.message ? e.message : String(e));
    }
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ready);
  } else {
    ready();
  }
})();
