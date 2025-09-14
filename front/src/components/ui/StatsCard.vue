<template>
  <q-card class="stats-card">
    <q-card-section class="q-pa-lg">
      <div class="row items-center">
        <div class="col">
          <div class="text-h3 text-weight-bold" :class="`text-${color}`">
            <CountUp
              v-if="!loading"
              :end-val="value"
              :duration="1.5"
            />
            <q-skeleton v-else type="text" width="60px" height="48px" />
          </div>
          <div class="text-subtitle1 text-grey-7 q-mt-xs">
            {{ title }}
          </div>
        </div>
        <div class="col-auto">
          <q-icon
            :name="icon"
            size="3rem"
            :color="color"
            class="stats-icon"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface Props {
  title: string
  value: number
  icon: string
  color: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// Simple CountUp component implementation
const CountUp = defineComponent({
  props: {
    endVal: Number,
    duration: { type: Number, default: 1 }
  },
  setup(props) {
    const displayValue = ref(0)
    
    watch(() => props.endVal, () => {
      const startTime = Date.now()
      const startVal = displayValue.value
      const change = props.endVal - startVal
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / (props.duration * 1000), 1)
        
        displayValue.value = Math.floor(startVal + (change * progress))
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      
      animate()
    }, { immediate: true })
    
    return () => h('span', displayValue.value)
  }
})
</script>

<script lang="ts">
import { defineComponent, h } from 'vue'

export default {}
</script>

<style lang="sass" scoped>
.stats-card
  transition: transform 0.2s ease, box-shadow 0.2s ease
  
  &:hover
    transform: translateY(-2px)
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1)

.stats-icon
  opacity: 0.7
</style>
