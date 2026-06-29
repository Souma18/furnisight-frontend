export function useAdminTemplateParser({ templates, vouchers, campaignForm, notifyForm, publish }) {
  function applyTemplateToForm(templateId, formTarget) {
    if (!templateId) return
    const t = templates.value.find(x => x.id === templateId)
    if (t) {
      let title = t.titleTemplate || ''
      let body = t.bodyTemplate || ''
      
      // Replace variables if a voucher is selected
      let selectedVoucher = null
      if (formTarget === 'campaign' && campaignForm.voucherId) {
        selectedVoucher = vouchers.value.find(v => v.id === campaignForm.voucherId)
      } else if (formTarget === 'notify' && notifyForm.relatedVoucherId) {
        selectedVoucher = vouchers.value.find(v => v.id === notifyForm.relatedVoucherId)
      } else if (formTarget === 'publish' && publish.value?.voucher) {
        selectedVoucher = publish.value.voucher
      }
      
      if (selectedVoucher) {
        title = title.replace(/\{\{voucherName\}\}/g, selectedVoucher.name || '')
        title = title.replace(/\{\{voucherDescription\}\}/g, selectedVoucher.description || '')
        
        const vName = selectedVoucher.name || ''
        const vDesc = selectedVoucher.description || ''
        
        const match = body.match(/<!--\s*UNLAYER_DESIGN_START\s*([\s\S]*?)\s*UNLAYER_DESIGN_END\s*-->/)
        if (match && match[1]) {
          try {
            let htmlPart = body.replace(match[0], '')
            htmlPart = htmlPart.replace(/\{\{voucherName\}\}/g, vName).replace(/\{\{voucherDescription\}\}/g, vDesc)
            
            let designObj = JSON.parse(match[1])
            const replaceInObj = (obj) => {
              for (const key in obj) {
                if (typeof obj[key] === 'string') {
                  obj[key] = obj[key].replace(/\{\{voucherName\}\}/g, vName).replace(/\{\{voucherDescription\}\}/g, vDesc)
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                  replaceInObj(obj[key])
                }
              }
            }
            replaceInObj(designObj)
            body = `<!-- UNLAYER_DESIGN_START ${JSON.stringify(designObj)} UNLAYER_DESIGN_END -->\n${htmlPart}`
          } catch (e) {
            console.error('Failed to replace vars in JSON', e)
            body = body.replace(/\{\{voucherName\}\}/g, vName).replace(/\{\{voucherDescription\}\}/g, vDesc)
          }
        } else {
          body = body.replace(/\{\{voucherName\}\}/g, vName).replace(/\{\{voucherDescription\}\}/g, vDesc)
        }
      }
  
      if (formTarget === 'campaign') {
        campaignForm.notificationTitle = title
        campaignForm.notificationBody = body
      } else if (formTarget === 'notify') {
        notifyForm.title = title
        notifyForm.body = body
      } else if (formTarget === 'publish') {
        publish.value.title = title
        publish.value.body = body
      }
    }
  }

  return {
    applyTemplateToForm
  }
}
