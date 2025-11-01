<template>
  <div 
    ref="threeContainer" 
    class="particle-background" 
    :style="{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      pointerEvents: 'auto', 
      zIndex: zIndex 
    }"
  ></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

// Props 定義
interface Props {
  enabled?: boolean
  maxParticles?: number
  particleRadius?: number
  spawnInterval?: number // 生成間隔（毫秒）
  singleSpawnChance?: number // 生成一個粒子的機率
  doubleSpawnChance?: number // 生成兩個粒子的機率
  particleLifetime?: number // 粒子生命週期（毫秒）
  zIndex?: number
  colors?: {
    hueRange?: [number, number]
    saturationRange?: [number, number]
    lightnessRange?: [number, number]
  }
}

const props = withDefaults(defineProps<Props>(), {
  enabled: true,
  maxParticles: 5,
  particleRadius: 1,
  spawnInterval: 1000,
  singleSpawnChance: 0.35,
  doubleSpawnChance: 0.15,
  particleLifetime: 5000,
  zIndex: 2,
  colors: () => ({
    hueRange: [0.25, 0.6],
    saturationRange: [0.6, 1.0],
    lightnessRange: [0.5, 0.9]
  })
})

const threeContainer = ref<HTMLElement>()

// Three.js 相關變數
let scene: any
let camera: any
let renderer: any
let animationId: number
let handleMouseMove: any = null
let dynamicParticles: any = null
let clickEffects: any[] = []

// 創建動態粒子系統
const createDynamicParticles = (THREE: any) => {
  const group = new THREE.Group()
  const maxParticles = props.maxParticles
  const particleRadius = props.particleRadius
  
  // 檢查位置是否與現有粒子重疊（考慮放大後的大小）
  const isPositionValid = (newPos: any, existingParticles: any[]) => {
    for (const particleGroup of existingParticles) {
      const distance = Math.sqrt(
        Math.pow(newPos.x - particleGroup.position.x, 2) +
        Math.pow(newPos.y - particleGroup.position.y, 2)
      )

      // 計算現有粒子的當前大小（考慮放大效果）
      const currentTime = Date.now()
      const age = currentTime - particleGroup.userData.createTime
      const lifeRatio = Math.min(age / particleGroup.userData.lifeTime, 1)
      const currentScale = 1 + (lifeRatio * 0.5) // 1倍到1.5倍
      const currentRadius = particleRadius * currentScale

      // 確保間距至少是兩個粒子半徑之和的1.2倍
      const minDistance = (particleRadius + currentRadius) * 1.2
      if (distance < minDistance) {
        return false
      }
    }
    return true
  }
  
  // 生成隨機位置
  const generateRandomPosition = (existingParticles: any[]) => {
    let attempts = 0
    let newPos
    do {
      // 使用與相機視錐體一致的邊界
      const aspect = window.innerWidth / window.innerHeight
      const frustumSize = 15
      const worldWidth = frustumSize * aspect
      const worldHeight = frustumSize
      
      newPos = {
        x: (Math.random() - 0.5) * worldWidth,
        y: (Math.random() - 0.5) * worldHeight,
        z: (Math.random() - 0.5) * 2
      }
      attempts++
    } while (!isPositionValid(newPos, existingParticles) && attempts < 100)
    
    return newPos
  }
  
  // 添加新粒子
  const addParticle = () => {
    if (group.children.length >= maxParticles) return

    const existingParticles = Array.from(group.children)
    const newPos = generateRandomPosition(existingParticles)

    // 創建粒子組（包含內圈和外圈）
    const particleGroup = new THREE.Group()
    particleGroup.position.set(newPos.x, newPos.y, newPos.z)

    // 內圈（主粒子）
    const geometry = new THREE.SphereGeometry(particleRadius, 16, 16)

    // 使用 props 中的顏色設定（降低飽和度和亮度，讓粒子更柔和）
    const hue = (props.colors.hueRange?.[0] ?? 0.25) + Math.random() * ((props.colors.hueRange?.[1] ?? 0.6) - (props.colors.hueRange?.[0] ?? 0.25))
    const saturation = ((props.colors.saturationRange?.[0] ?? 0.6) + Math.random() * ((props.colors.saturationRange?.[1] ?? 1.0) - (props.colors.saturationRange?.[0] ?? 0.6))) * 0.4  // 降低飽和度到 40%
    const lightness = ((props.colors.lightnessRange?.[0] ?? 0.5) + Math.random() * ((props.colors.lightnessRange?.[1] ?? 0.9) - (props.colors.lightnessRange?.[0] ?? 0.5))) * 0.6  // 降低亮度到 60%

    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue, saturation, lightness),
      transparent: true,
      opacity: 0.3,
      side: THREE.FrontSide
    })

    const particle = new THREE.Mesh(geometry, material)

    // 外圈（approach circle）- 使用 RingGeometry
    const ringThickness = particleRadius * 0.08 // 外圈厚度
    const ringGeometry = new THREE.RingGeometry(
      particleRadius - ringThickness,  // 內半徑，稍微小於粒子半徑
      particleRadius + ringThickness,  // 外半徑，稍微大於粒子半徑
      64  // 增加段數讓圓圈更平滑
    )
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue, saturation, lightness),
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    })

    const approachCircle = new THREE.Mesh(ringGeometry, ringMaterial)
    // 讓外圈面向相機
    approachCircle.lookAt(camera.position)

    // 將內圈和外圈加入組
    particleGroup.add(particle)
    particleGroup.add(approachCircle)

    particleGroup.userData = {
      originalPosition: { ...newPos },
      pulsePhase: Math.random() * Math.PI * 2,
      rotationSpeed: 0.01 + Math.random() * 0.02,
      createTime: Date.now(),
      lifeTime: props.particleLifetime,
      innerParticle: particle,
      approachCircle: approachCircle
    }

    group.add(particleGroup)
  }
  
  // 將管理函數附加到group上
  group.userData = {
    addParticle,
    maxParticles,
    lastSpawnTime: Date.now()
  }
  
  // 初始化一個粒子
  group.userData.addParticle()
  
  return group
}

// 創建點擊特效
const createClickEffect = (THREE: any, position: any, cameraPosition: any) => {
  const group = new THREE.Group()
  
  // 波紋擴散
  for (let i = 0; i < 3; i++) {
    const rippleGeometry = new THREE.RingGeometry(0.1, 0.2, 32)
    const rippleMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(0.3, 0.8, 0.8),
      transparent: true,
      opacity: 0.8 - i * 0.2,
      side: THREE.DoubleSide
    })
    
    const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial)
    ripple.position.copy(position)
    ripple.lookAt(cameraPosition)
    
    ripple.userData = {
      expandSpeed: 0.1 + i * 0.05,
      fadeSpeed: 0.02,
      delay: i * 100
    }
    
    group.add(ripple)
  }
  
  // 光束粒子
  for (let i = 0; i < 8; i++) {
    const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8)
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.8, 0.9),
      transparent: true,
      opacity: 1
    })
    
    const particle = new THREE.Mesh(particleGeometry, particleMaterial)
    particle.position.copy(position)
    
    const angle = (i / 8) * Math.PI * 2
    particle.userData = {
      velocity: {
        x: Math.cos(angle) * 0.05,
        y: Math.sin(angle) * 0.05,
        z: (Math.random() - 0.5) * 0.02
      },
      life: 2.0,
      fadeSpeed: 0.02
    }
    
    group.add(particle)
  }
  
  return group
}

// 初始化Three.js場景
const initThreeJS = async () => {
  if (!threeContainer.value || !props.enabled) return

  try {
    const THREE = await import('three')
    
    // 創建場景
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)

    // 創建相機
    const getCameraParams = () => {
      const aspect = window.innerWidth / window.innerHeight
      const frustumSize = 15
      return {
        left: frustumSize * aspect / -2,
        right: frustumSize * aspect / 2,
        top: frustumSize / 2,
        bottom: frustumSize / -2
      }
    }
    
    const cameraParams = getCameraParams()
    camera = new THREE.OrthographicCamera(
      cameraParams.left,
      cameraParams.right,
      cameraParams.top,
      cameraParams.bottom,
      0.1,
      1000
    )
    camera.position.z = 10
    camera.lookAt(0, 0, 0)

    // 創建渲染器
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    threeContainer.value.appendChild(renderer.domElement)

    // 創建動態粒子系統
    dynamicParticles = createDynamicParticles(THREE)
    scene.add(dynamicParticles)

    // 滑鼠hover事件處理
    const mouse = new THREE.Vector2()
    let hoveredParticle: any = null

    const handleMouseMove = (event: MouseEvent) => {
      const x = event.clientX
      const y = event.clientY
      
      mouse.x = (x / window.innerWidth) * 2 - 1
      mouse.y = -(y / window.innerHeight) * 2 + 1
      
      let closestParticle: any = null
      let closestDistance = Infinity
      
      const aspect = window.innerWidth / window.innerHeight
      const frustumSize = 15
      const worldWidth = frustumSize * aspect
      const worldHeight = frustumSize
      
      dynamicParticles.children.forEach((particleGroup: any) => {
        const worldMouseX = mouse.x * (worldWidth / 2)
        const worldMouseY = mouse.y * (worldHeight / 2)

        const distance = Math.sqrt(
          Math.pow(worldMouseX - particleGroup.position.x, 2) +
          Math.pow(worldMouseY - particleGroup.position.y, 2)
        )

        const currentScale = particleGroup.userData.innerParticle.scale.x
        const particleRadius = props.particleRadius * currentScale

        if (distance < particleRadius && distance < closestDistance) {
          closestDistance = distance
          closestParticle = particleGroup
        }
      })
      
      const targetParticle = closestParticle
      
      if (targetParticle && hoveredParticle !== targetParticle) {
        dynamicParticles.remove(targetParticle)
        
        if (Math.random() < 0.5) {
          dynamicParticles.userData.addParticle()
        }
        
        const effect = createClickEffect(THREE, targetParticle.position, camera.position)
        scene.add(effect)
        clickEffects.push({
          effect: effect,
          life: 2.0,
          startTime: Date.now()
        })
        
        hoveredParticle = null
      } else if (!targetParticle) {
        hoveredParticle = null
      }
    }

    document.addEventListener('mousemove', handleMouseMove)

    // 動畫循環
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      const currentTime = Date.now()
      
      // 更新動態粒子
      for (let i = dynamicParticles.children.length - 1; i >= 0; i--) {
        const particleGroup = dynamicParticles.children[i]
        const userData = particleGroup.userData

        const age = currentTime - userData.createTime

        // 定義三個階段：
        // 0.0 - 0.7: 接近階段（內圈放大，外圈縮小）
        // 0.7 - 0.7+0.5s: 重合+淡出階段（達到最大後0.5秒內消失）

        // 計算重合+淡出時間（0.5秒）
        const holdAndFadeDuration = 500 // 毫秒
        const totalLifeTime = userData.lifeTime
        const holdAndFadeRatio = holdAndFadeDuration / totalLifeTime

        const approachPhase = 0.7  // 接近階段結束點
        const holdPhase = approachPhase + holdAndFadeRatio  // 重合後0.1秒就消失

        const lifeRatio = age / userData.lifeTime

        // 如果超過 holdPhase，立即移除粒子
        if (lifeRatio >= holdPhase) {
          dynamicParticles.remove(particleGroup)
          continue
        }

        let innerScale, innerOpacity, approachScale, approachOpacity

        if (lifeRatio < approachPhase) {
          // 接近階段：內圈逐漸放大，外圈逐漸縮小
          const phaseRatio = lifeRatio / approachPhase
          const minInnerScale = 0.5  // 內圈起始大小
          const maxInnerScale = 1.5  // 內圈最大大小
          innerScale = minInnerScale + (phaseRatio * (maxInnerScale - minInnerScale))

          // 內外圈使用相同的透明度變化（降低最大透明度，讓粒子更柔和）
          const opacity = 0.2 + (phaseRatio * 0.4)  // 0.2 -> 0.6
          innerOpacity = opacity
          approachOpacity = opacity

          // 外圈需要考慮環的厚度
          // 外圈的內環半徑 = approachScale * (particleRadius - ringThickness)
          // 應該等於內圈的外環半徑 = innerScale * particleRadius
          // 所以 approachScale = innerScale * particleRadius / (particleRadius - ringThickness)
          const ringThickness = props.particleRadius * 0.08
          const maxApproachScale = 2.5  // 外圈起始大小
          const targetApproachScale = maxInnerScale * props.particleRadius / (props.particleRadius - ringThickness * 0.5)
          approachScale = maxApproachScale - (phaseRatio * (maxApproachScale - targetApproachScale))
        } else if (lifeRatio < holdPhase) {
          // 重合+淡出階段：達到最大後0.1秒內消失
          // 外圈的內環碰到內圈的外環
          const phaseRatio = (lifeRatio - approachPhase) / holdAndFadeRatio
          const ringThickness = props.particleRadius * 0.08
          innerScale = 1.5
          approachScale = 1.5 * props.particleRadius / (props.particleRadius - ringThickness * 0.5)

          // 內外圈使用相同的透明度（降低最大透明度）
          const opacity = 0.6 * (1 - phaseRatio)  // 從0.6淡到0
          innerOpacity = opacity
          approachOpacity = opacity
        } else {
          // 超過時間，直接移除（這個分支基本上不會執行，因為粒子會在holdPhase就被移除）
          const ringThickness = props.particleRadius * 0.08
          innerScale = 1.5
          approachScale = 1.5 * props.particleRadius / (props.particleRadius - ringThickness * 0.5)
          innerOpacity = 0
          approachOpacity = 0
        }

        // 更新內圈
        userData.innerParticle.scale.setScalar(innerScale)
        userData.innerParticle.material.opacity = innerOpacity

        // 更新外圈
        userData.approachCircle.scale.setScalar(approachScale)
        userData.approachCircle.material.opacity = approachOpacity

        particleGroup.position.set(
          userData.originalPosition.x,
          userData.originalPosition.y,
          userData.originalPosition.z
        )
      }
      
      // 粒子生成邏輯
      if (!dynamicParticles.userData.lastSpawnTime) {
        dynamicParticles.userData.lastSpawnTime = currentTime
      }
      
      if (currentTime - dynamicParticles.userData.lastSpawnTime >= props.spawnInterval) {
        dynamicParticles.userData.lastSpawnTime = currentTime

        const random = Math.random()
        if (random < props.doubleSpawnChance) {
          dynamicParticles.userData.addParticle()
          dynamicParticles.userData.addParticle()
        } else if (random < props.doubleSpawnChance + props.singleSpawnChance) {
          dynamicParticles.userData.addParticle()
        }
      }
      
      // 更新點擊特效
      for (let i = clickEffects.length - 1; i >= 0; i--) {
        const effectData = clickEffects[i]
        const elapsed = (currentTime - effectData.startTime) / 1000
        
        effectData.effect.children.forEach((child: any) => {
          if (child.userData) {
            const userData = child.userData
            
            if (userData.expandSpeed) {
              const scale = 1 + elapsed * userData.expandSpeed * 10
              child.scale.setScalar(scale)
              child.material.opacity = Math.max(0, 0.8 - elapsed * 2)
            } else if (userData.velocity) {
              child.position.x += userData.velocity.x
              child.position.y += userData.velocity.y
              child.position.z += userData.velocity.z
              
              userData.life -= 0.016
              child.material.opacity = Math.max(0, userData.life / 2.0)
            }
          }
        })
        
        if (elapsed > 2.0) {
          scene.remove(effectData.effect)
          clickEffects.splice(i, 1)
        }
      }
      
      renderer.render(scene, camera)
    }

    animate()

    // 處理視窗大小變化
    const handleResize = () => {
      const cameraParams = getCameraParams()
      camera.left = cameraParams.left
      camera.right = cameraParams.right
      camera.top = cameraParams.top
      camera.bottom = cameraParams.bottom
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)
  } catch (error) {
    console.error('Failed to load Three.js:', error)
  }
}

// 清理Three.js
const cleanupThreeJS = () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (renderer && threeContainer.value) {
    threeContainer.value.removeChild(renderer.domElement)
    renderer.dispose()
  }
  if (handleMouseMove) {
    document.removeEventListener('mousemove', handleMouseMove)
  }
}

// 監聽 enabled prop 變化
watch(() => props.enabled, (newEnabled) => {
  if (newEnabled && !scene) {
    initThreeJS()
  } else if (!newEnabled && scene) {
    cleanupThreeJS()
  }
})

onMounted(() => {
  if (props.enabled) {
    initThreeJS()
  }
})

onUnmounted(() => {
  cleanupThreeJS()
})
</script>

<style scoped>
.particle-background {
  pointer-events: auto;
}

.particle-background canvas {
  position: fixed;
  top: 0;
  left: 0;
  z-index: inherit;
  pointer-events: auto;
}
</style>
