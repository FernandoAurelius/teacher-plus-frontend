import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: { template: '<div>home</div>' } }],
})

describe('App', () => {
  beforeEach(async () => {
    if (!router.currentRoute.value.matched.length) {
      await router.push('/')
    }
    await router.isReady()
  })

  it('monta com pinia e router sem quebrar', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router],
        stubs: { 'router-view': { template: '<div />' } },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
