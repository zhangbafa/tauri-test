<template>
  <a-form ref="formRef" :rules="rules" :model="form" @submit="handleSubmit"
      style="position: relative;margin-bottom: 50px;">
      <a-card title="售价与产品成本" style="margin-bottom: 10px">
          <a-form-item field="productPrice" label="产品售价">
              <a-input v-model="form.productPrice" placeholder="￥" />
          </a-form-item>
          <a-form-item field="productCost" label="产品成本">
              <a-input v-model="form.productCost" placeholder="￥" />
          </a-form-item>
      </a-card>
      
      <a-card title="快递成本（每单）" style="margin-bottom: 10px">
          <a-form-item field="expressFee" label="快递费">
              <a-input v-model="form.expressFee" placeholder="￥" />
          </a-form-item>
          <a-form-item field="packagingFee" label="包装费">
              <a-input v-model="form.packagingFee" placeholder="￥" />
          </a-form-item>
          <a-form-item field="handlingFee" label="打包费">
              <a-input v-model="form.handlingFee" placeholder="￥" />
          </a-form-item>
      </a-card>
      <a-collapse style="margin-bottom: 10px;">
          <a-collapse-item header="仓库物流（每单）" key="1">
            <a-form-item field="warehouseCost" label="仓储成本">
              <a-input v-model="form.warehouseCost" placeholder="￥" />
          </a-form-item>
          <a-form-item field="logisticsCost" label="物流成本">
              <a-input v-model="form.logisticsCost" placeholder="￥" />
          </a-form-item>
          </a-collapse-item>
      </a-collapse>
      <a-collapse style="margin-bottom: 10px;">
          <a-collapse-item header="员工成本（每单）" key="1">
              <a-form-item field="staffCost" label="员工成本">
                  <a-input v-model="form.staffCost" placeholder="￥" />
              </a-form-item>
          </a-collapse-item>
      </a-collapse>
      <a-collapse style="margin-bottom: 10px;">
          <a-collapse-item header="销售提成" key="1">
              <a-form-item field="laborCommission" label="人工提成">
                  <a-input v-model="form.laborCommission" placeholder="￥" />
              </a-form-item>
              <a-form-item field="platformDeduction" label="平台扣点">
                  <a-input v-model="form.platformDeduction" placeholder="￥" />
              </a-form-item>
          </a-collapse-item>
      </a-collapse>
      <a-collapse style="margin-bottom: 10px;">
          <a-collapse-item header="售后成本（每单）" key="1">
              <a-form-item field="returnCost" label="退货成本">
                  <a-input v-model="form.returnCost" placeholder="￥" />
              </a-form-item>
              <a-form-item field="unshippedReturnRate" label="未发退货率">
                  <a-input v-model="form.unshippedReturnRate" placeholder="￥" />
              </a-form-item>
              <a-form-item field="shippedReturnRate" label="已发退货率">
                  <a-input v-model="form.shippedReturnRate" placeholder="￥" />
              </a-form-item>
          </a-collapse-item>
      </a-collapse>
      <a-collapse style="margin-bottom: 10px;">
          <a-collapse-item header="其他成本" key="1">
              <a-form-item field="otherCosts" label="其他成本">
                  <a-input v-model="form.otherCosts" placeholder="￥" />
              </a-form-item>
          </a-collapse-item>
      </a-collapse>
      <div class="footer-action">
          <a-space>
              <a-button html-type="submit" type="primary">立即计算</a-button>
              <a-button @click="$refs.formRef.resetFields()">重置</a-button>
              <a-button type="text">保本ROI为: {{ breakEvenROI }}</a-button>
              <a-button type="text" @click="updateApp">利润率为: {{ profitMargin }}%</a-button>
          </a-space>
      </div>
  </a-form>
  <!-- {{ form }} -->
</template>

<style>
/* Custom scrollbar styles */
::-webkit-scrollbar {
  width: 8px;
  /* Thin scrollbar */
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  /* Light background for the track */
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #ddd;
  /* Dark grey scrollbar thumb */
  border-radius: 4px;
  /* Rounded corners */
}

::-webkit-scrollbar-thumb:hover {
  background: #888;
  /* Darker on hover */
}

/* Remove up/down arrows from number input */
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
  /* Firefox */
}

.footer-action {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  /* padding: 10px; */
  height: 60px;
  /* line-height: 50px; */
  border-top: 1px solid var(--color-neutral-3);
  background-color: var(--color-neutral-2);
}

.arco-collapse-item-header {
  font-size: 16px;
}
</style>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';

// Create reactive references for ROI and profit margin
const breakEvenROI = ref('0')
const profitMargin = ref('0')

const handleSubmit = ({ values, errors }) => {
  // Convert all form values to numbers
  if (errors) {
      console.log('Form validation failed:', errors);
      return;
  }
  if (form.productPrice === form.productCost) {
      Message.error('产品售价和成本一样，别干了')
      return
  }
  const productPrice = Number(form.productPrice)
  const productCost = Number(form.productCost)
  const warehouseCost = Number(form.warehouseCost)
  const logisticsCost = Number(form.logisticsCost)
  const expressFee = Number(form.expressFee)
  const packagingFee = Number(form.packagingFee)
  const handlingFee = Number(form.handlingFee)
  const staffCost = Number(form.staffCost)
  const laborCommission = Number(form.laborCommission)
  const platformDeduction = Number(form.platformDeduction)
  const returnCost = Number(form.returnCost)
  const unshippedReturnRate = Number(form.unshippedReturnRate)
  const shippedReturnRate = Number(form.shippedReturnRate)
  const otherCosts = Number(form.otherCosts)

  // Calculate commission rate
  const rate1 = laborCommission * 1
  const rate2 = platformDeduction * 1
  const rate = (rate1 + rate2) * 0.01 * productPrice

  // Calculate ROI
  const roi = productPrice * (1 - unshippedReturnRate / 100)
      - productCost
      - warehouseCost
      - logisticsCost
      - expressFee
      - packagingFee
      - handlingFee
      - staffCost
      - rate
      - (1 - unshippedReturnRate / 100) * shippedReturnRate / 100 * returnCost
      - otherCosts

  // Calculate break-even point and profit margin
  const breakEvenPoint = productPrice / roi
  const profitMarginCalc = 1 / breakEvenPoint * 10000

  // Update reactive references with rounded values
  breakEvenROI.value = Math.round(breakEvenPoint * 100) / 100
  profitMargin.value = Math.round(profitMarginCalc) / 100

  // Optional: log calculations for debugging
  console.log('Product Price:', productPrice)
  console.log('Total Costs:', roi)
  // console.log('Break-even ROI:', breakEvenROI.value)
  // console.log('Profit Margin:', profitMargin.value)
}

const form = reactive({
  productPrice: '', // 产品售价
  productCost: '', // 产品成本
  warehouseCost: '0', // 仓储成本
  logisticsCost: '0', // 物流成本
  expressFee: '0', // 快递费
  packagingFee: '0', // 包装费
  handlingFee: '0', // 打包费
  staffCost: '0', // 员工成本
  laborCommission: '0', // 人工提成
  platformDeduction: '0', // 平台扣点
  returnCost: '0', // 退货成本
  unshippedReturnRate: '0', // 未发退货率
  shippedReturnRate: '0', // 已发退货率
  otherCosts: '0' // 其他成本
});
const rules = {
  productPrice: [
      {
          required: true,
          message: '请输入产品售价',
      },
      {
          validator: (value, callback) => {
              if (value !== '' && isNaN(Number(value))) {
                  callback('请输入有效的数字')
              }
          }
      }
  ],
  productCost: [
      {
          required: true,
          message: '请输入产品成本',
      },
      {
          validator: (value, callback) => {
              if (value !== '' && isNaN(Number(value))) {
                  callback('请输入有效的数字')
              }
          }
      }
  ],
  warehouseCost: [
      {
          required: true,
          message: '请输入仓储成本',
      },
      {
          validator: (value, callback) => {
              if (isNaN(Number(value))) {
                  callback('请输入有效的数字')
              }
          }
      }
  ],
  logisticsCost: [
      {
          required: true,
          message: '请输入物流成本',
      },
      {
          validator: (value, callback) => {
              if (isNaN(Number(value))) {
                  callback('请输入有效的数字')
              }
          }
      }
  ],
  expressFee: [
      {
          required: true,
          message: '请输入快递费',
      },
      {
          validator: (value, callback) => {
              if (isNaN(Number(value))) {
                  callback('请输入有效的数字')
              }
          }
      }
  ],
  packagingFee: [
      {
          required: true,
          message: '请输入快递包装费',
      },
      {
          validator: (value, callback) => {
              if (isNaN(Number(value))) {
                  callback('请输入有效的数字')
              }
          }
      }
  ],
  handlingFee: [
      {
          required: true,
          message: '请输入快递打包费',
      },
      {
          validator: (value, callback) => {
              if (isNaN(Number(value))) {
                  callback('请输入有效的数字')
              }
          }
      }
  ],
  staffCost: [
      {
          required: true,
          message: '请输入员工成本',
      },
      {
          validator: (value, callback) => {
              if (isNaN(Number(value))) {
                  callback('请输入有效的数字')
              }
          }
      }
  ],
  laborCommission: [
      {
          required: true,
          message: '请输入人工提成',
      },
      {
          validator: (value, callback) => {
              if (isNaN(Number(value))) {
                  callback('请输入有效的数字')
              }
          }
      }
  ],
  platformDeduction: [
      {
          required: true,
          message: '请输入平台扣点',
      },
      {
          validator: (value, callback) => {
              if (isNaN(Number(value))) {
                  callback('请输入有效的数字')
              }
          }
      }
  ],
  returnCost: [
      {
          required: true,
          message: '请输入退货成本',
      },
      {
          validator: (value, callback) => {
              if (isNaN(Number(value))) {
                  callback('请输入有效的数字')
              }
          }
      }
  ],
  unshippedReturnRate: [
      {
          required: true,
          message: '请输入未发退货率',
      },
      {
          validator: (value, callback) => {
              if (isNaN(Number(value))) {
                  callback('请输入有效的数字')
              }
          }
      }
  ],
  shippedReturnRate: [
      {
          required: true,
          message: '请输入已发退货率',
      },
      {
          validator: (value, callback) => {
              if (isNaN(Number(value))) {
                  callback('请输入有效的数字')
              }
          }
      }
  ],
  otherCosts: [
      {
          required: false,
          message: '其他成本',
      },
      {
          validator: (value, callback) => {
              if (value !== '' && isNaN(Number(value))) {
                  callback('请输入有效的数字')
              }
          }
      }
  ],
};

onMounted(() => {
  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  function handleThemeChange(event) {
      if (event.matches) {
          // 切换到深色模式
          dark.value = true
          document.body.style.setProperty('color-scheme', 'dark');
          document.body.setAttribute('arco-theme', 'dark');

      } else {
          // 切换到浅色模式
          // dark.value = false
          document.body.style.setProperty('color-scheme', 'light');
          document.body.removeAttribute('arco-theme');

      }
  }
  // 初次加载时检查主题
  handleThemeChange(darkModeQuery);
  // 监听主题变化事件
  darkModeQuery.addEventListener('change', handleThemeChange);
})


</script>