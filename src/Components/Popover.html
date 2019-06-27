<svelte:window bind:innerWidth={w} />
<div class="popover" bind:this={popover}>
  <div class="trigger" on:click={doOpen} bind:this={triggerContainer}>
    <slot name="trigger">
    </slot>
  </div>
  <div 
    class="contents-wrapper" 
    class:visible={open}
    class:shrink={shrink}
    style="transform: translate(-50%,-50%) translate({translateX}px, {translateY}px)" 
    bind:this={contentsWrapper}>
    <div class="contents" bind:this={contentsAnimated}>
      <div class="contents-inner">
        <slot name="contents"></slot>
      </div>
    </div>
  </div>
</div>

<style>
  .popover { 
    position: relative;
  }

  .contents-wrapper { 
    transform: translate(-50%, -50%); 
    position: absolute;
    top: 50%; 
    left: 50%; 
    transition: none;
    z-index: 2;
    display: none;
  }

  .contents { 
    background: #fff;
    box-shadow: 0px 10px 26px rgba(0,0,0,0.4) ;
    opacity: .8; 
    padding-top: 0;
    display: none;
    animation: grow 200ms forwards cubic-bezier(.92,.09,.18,1.05);
  }

  .contents-inner { 
    animation: fadeIn 400ms forwards;
  }

  .contents-wrapper.visible { 
    display: block;
  }

  .contents-wrapper.visible .contents { 
    opacity: 1; 
    transform: scale(1);
    display: block;
  }

  .contents-wrapper.shrink .contents { 
    animation: shrink 150ms forwards cubic-bezier(.92,.09,.18,1.05);
  }

  @keyframes grow { 
    0% { 
      transform: scale(.9,.1); 
      opacity: 0; 
    }
    30% { 
      opacity: 1; 
    }
    100% { 
      transform: scale(1);
    }
  }

  @keyframes shrink { 
    0% { 
      transform: scale(1); 
      opacity: 1; 
    }
    70% { 
      opacity: 1; 
    }
    100% { 
      opacity: 0; 
      transform: scale(.9,.1);
    }
  }

  @keyframes fadeIn { 
    0% { 
      opacity: 0; 
    }
    50% { 
      opacity: 0;
    }
    100% { 
      opacity: 1; 
    }
  }

</style>

<script>
  import { onMount, createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  export let open = false;
  export let shrink;
  export let trigger;

  let popover
  let w
  let triggerContainer
  let contentsAnimated
  let contentsWrapper
  let translateY = 0
  let translateX = 0

  function checkForFocusLoss(evt) { 
    if(!open) return;
    let el = evt.target;
    do {
      if(el == popover) return;
    } while(el = el.parentNode)
    close();
  }; 

  let once = (el,evt,cb) => { 
    function handler() { 
      cb.apply(this,arguments); 
      el.removeEventListener(evt,handler);
    }
    el.addEventListener(evt,handler);
  }

  onMount(() => {
    document.addEventListener('click',checkForFocusLoss.bind(this)); 
    if(!trigger) return; 
    triggerContainer.appendChild(trigger.parentNode.removeChild(trigger));

    return () => {
      document.removeEventListener('click', checkForFocusLoss);
    }
  })

  function getDistanceToEdges() { 
    if(!open) { open = true }
    let width = contentsWrapper.offsetWidth; 
    let height = contentsWrapper.offsetHeight; 
    let rect = contentsWrapper.getBoundingClientRect(); 
    return { 
      top: rect.top + (-1*translateY), 
      bottom: window.innerHeight - rect.bottom + translateY, 
      left: rect.left + (-1*translateX), 
      right: document.body.clientWidth - rect.right + translateX
    }
  }

  function getTranslate() { 
    let dist = getDistanceToEdges(); 
    let translateX, translateY; 
    if(w < 480) { 
      translateY = dist.bottom;
    } else if(dist.top < 0) { 
      translateY = Math.abs(dist.top); 
    } else if(dist.bottom < 0) { 
      translateY = dist.bottom; 
    } else { 
      translateY = 0; 
    }
    if(dist.left < 0) { 
      translateX = Math.abs(dist.left); 
    } else if(dist.right < 0) { 
      translateX = dist.right;
    } else { 
      translateX = 0; 
    }
    return { translateX, translateY }  
  }

  function doOpen() { 
    const {
      translateX,
      translateY
    } = getTranslate()

    translateX = translateX
    translateY = translateY
    open = true

    dispatch('opened');
  }

  export function close() { 
    shrink = true
    once(contentsAnimated, 'animationend', () => {
      shrink = false
      open = false
      dispatch('closed')
    });
  }
</script>