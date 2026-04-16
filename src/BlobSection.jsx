import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import './BlobSection.css'

const funCards = [
  {
    text: "Research & Development is the beating heart of AURA Studio. We dedicate 20% of our resources to exploring undocumented WebGL APIs, experimental physics engines, and procedural generation algorithms."
  },
  {
    text: "We believe in rapid prototyping. From wireframes to functional 3D environments, our iterative process ensures we fail fast and innovate faster, delivering experiences that are truly unprecedented."
  },
  {
    text: "The web is transitioning from a document viewer to an immersive spatial computing platform. We are building the infrastructure and interactive paradigms required for this next evolution."
  }
]

const BlobSection = () => {
  const mountRef = useRef(null)
  const [activeCard, setActiveCard] = useState(0)

  const goNext = () => setActiveCard((prev) => (prev + 1) % funCards.length)
  const goPrev = () => setActiveCard((prev) => (prev - 1 + funCards.length) % funCards.length)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    // Scene
    const scene = new THREE.Scene()
    scene.background = null // transparent so website bg shows through

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 1000)
    camera.position.set(2.2, 1.5, 3.2)
    camera.lookAt(0, 0, 0)

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    // Lights
    const ambientLight = new THREE.AmbientLight(0x8d7dca, 0.8)
    scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0xaaaaff, 0.7)
    mainLight.position.set(2, 3, 2)
    scene.add(mainLight)

    const backLight = new THREE.DirectionalLight(0x606080, 0.5)
    backLight.position.set(-1, 1, -2)
    scene.add(backLight)

    // Geometry
    const geometry = new THREE.SphereGeometry(0.98, 200, 200)

    // Texture
    const textureUrl = 'https://images.unsplash.com/photo-1618327907149-58f2f1a0d0aa?w=800&auto=format'
    const loader = new THREE.TextureLoader()
    const texture = loader.load(textureUrl, (tex) => {
      tex.wrapS = THREE.RepeatWrapping
      tex.wrapT = THREE.RepeatWrapping
      tex.repeat.set(2.0, 1.5)
      tex.needsUpdate = true
    })

    // Shaders
    const vertexShader = `
      uniform float uTime;
      uniform float uAmplitudeMorph;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vUv = uv;
        vec3 pos = position;
        float time = uTime;
        float ampBase = 0.08 * (0.7 + 0.5 * sin(uTime * 0.32)) * uAmplitudeMorph;
        float ampMid = 0.05 * (0.8 + 0.4 * cos(uTime * 0.51)) * uAmplitudeMorph;
        float ampSmall = 0.03 * (0.9 + 0.3 * sin(uTime * 0.78)) * uAmplitudeMorph;

        float f1 = 2.2;
        float f2 = 3.5;
        float f3 = 5.0;

        float wave1 = sin(pos.x * f1 + time * 1.5) * cos(pos.z * f1 * 0.9 + time * 1.2);
        float wave2 = sin(pos.y * f2 * 1.1 + time * 1.9) * sin(pos.x * f2 * 0.7 + time * 1.3);
        float wave3 = cos(pos.z * f3 + time * 2.3) * sin(pos.y * f3 * 0.8 + time * 1.6);
        float wave4 = sin((pos.x * 1.3 + pos.z * 1.4) * 1.8 + time * 2.5) * cos((pos.y * 1.6) * 1.4);

        float displacement = (wave1 * ampBase + wave2 * ampMid + wave3 * ampSmall + wave4 * ampSmall * 0.8);
        vec3 newPos = pos + normal * displacement;

        vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
        vViewPosition = -mvPosition.xyz;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * mvPosition;
      }
    `

    const fragmentShader = `
      uniform float uTime;
      uniform sampler2D uTexture;
      uniform vec3 uTint;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vec2 uv = vUv;
        uv.x += uTime * 0.02;
        uv.y += uTime * 0.01;

        vec4 texColor = texture2D(uTexture, uv);
        vec3 color = texColor.rgb;

        // Tint towards our purple/blue palette
        color = mix(color, uTint, 0.55);

        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        vec3 lightDir = normalize(vec3(2.0, 3.0, 1.5));
        float diff = max(0.3, dot(normal, lightDir));
        color = color * (diff * 0.8 + 0.3);

        float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 0.8);
        color += vec3(0.25, 0.18, 0.45) * fresnel;

        gl_FragColor = vec4(color, 1.0);
      }
    `

    const blobUniforms = {
      uTime: { value: 0 },
      uAmplitudeMorph: { value: 1.0 },
      uTexture: { value: texture },
      uTint: { value: new THREE.Color(0x606080) }
    }

    const blobMaterial = new THREE.ShaderMaterial({
      uniforms: blobUniforms,
      vertexShader,
      fragmentShader,
      transparent: false,
      side: THREE.DoubleSide
    })

    const blobMesh = new THREE.Mesh(geometry, blobMaterial)
    scene.add(blobMesh)

    // Animation
    let animationId
    const animate = () => {
      const time = performance.now() / 1000
      blobUniforms.uTime.value = time
      blobMesh.rotation.y += 0.003
      blobMesh.rotation.x += 0.001
      renderer.render(scene, camera)
      animationId = requestAnimationFrame(animate)
    }
    animate()

    // Resize handler
    const handleResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
      renderer.dispose()
      geometry.dispose()
      blobMaterial.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <section className="scroll-section section-blob">
      <div className="blob-canvas-container" ref={mountRef}></div>
      <div className="blob-overlay">
        <h1 className="blob-title">INNOVATION LAB</h1>
        <div className="blob-card">
          <p className="blob-card-text">{funCards[activeCard].text}</p>
        </div>
        <div className="blob-controls">
          <button className="blob-btn" onClick={goPrev}>
            <span className="arrow-left"></span> prev
          </button>
          <div className="blob-dots">
            {funCards.map((_, i) => (
              <span
                key={i}
                className={`dot ${i === activeCard ? 'dot-active' : ''}`}
                onClick={() => setActiveCard(i)}
              ></span>
            ))}
          </div>
          <button className="blob-btn" onClick={goNext}>
            next <span className="arrow-right"></span>
          </button>
        </div>
      </div>
    </section>
  )
}

export default BlobSection
