import { shallowMount, mount } from '@vue/test-utils'
import SvgIcon from '@/components/SvgIcon/index.vue'
describe('SvgIcon.vue', () => {
  it('iconClass', () => {
    const wrapper = shallowMount(SvgIcon, {
      propsData: {
        iconClass: 'test'
      }
    })
    expect(wrapper.find('use').attributes().href).toBe('#icon-test')
  })
  it('className', () => {
    const wrapper = mount(SvgIcon, {
      propsData: {
        iconClass: 'test'
      }
    })
    expect(wrapper.classes().length).toBe(1)
    wrapper.setProps({ className: 'test' })
    wrapper.vm.$nextTick(() => {
      expect(wrapper.classes().includes('test')).toBe(true)
    })
  })
})
