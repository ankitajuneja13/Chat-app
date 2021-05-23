const socket =io()

//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $sendLocation =  document.querySelector('#send-location')
const $messages =document.querySelector('#messages')



//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username , room} = Qs.parse(location.search , {ignoreQueryPrefix : true})

const autoscroll = ()=>{
   //new msg element
   const $newMessage = $messages.lastElementChild

   //height of the new msg
   const newMessageStyles = getComputedStyle($newMessage)
   const newMessageMargin = parseInt(newMessageStyles.marginBottom)
   const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

   //visible height
   const visibleHeight = $messages.offsetHeight

   //height of messages container
   const containerHeight = $messages.scrollHeight

   //how far have i scrolled?
   const scrollOffset = $messages.scrollTop + visibleHeight

   if(containerHeight - newMessageHeight <= scrollOffset)
   {
      $messages.scrollTop = $messages.scrollHeight
   }

}

socket.on('message', (message )=>{                        // server is sending data through emit here and we are printing it
        console.log(message)
        const html = Mustache.render(messageTemplate ,{
           username : message.username,
           message : message.text,
           createdAt: moment(message.createdAt).format('h:mm a')
        })
        $messages.insertAdjacentHTML('beforeend',html)
        autoscroll()
     })

socket.on('locationMessage', (message)=>{                        
      console.log(message)
      const html = Mustache.render(locationMessageTemplate ,{
         username : message.username,
         url : message.url ,
         createdAt: moment(message.createdAt).format('h:mm a')
      })
      $messages.insertAdjacentHTML('beforeend',html)
      autoscroll()
   })

socket.on('roomData' , ({room , users}) =>{
   const html = Mustache.render(sidebarTemplate ,{
         room,
         users
   })

   document.querySelector('#sidebar').innerHTML = html
})


$messageForm.addEventListener('submit' , (e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled' ,'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message , (error)=>{

      $messageFormButton.removeAttribute('disabled')
      $messageFormInput.value=''
      $messageFormInput.focus()

       if(error)
       {
          return console.log(error)
       }
       console.log('the message was delievered')
    })
 })

$sendLocation.addEventListener('click' , ()=>{
    if(!navigator.geolocation)
    {
       return alert('Geolocation is not supported by your browser')
    }

    $sendLocation.setAttribute('disabled' ,'disabled')

    navigator.geolocation.getCurrentPosition((position) =>{
       //console.log(position)
      socket.emit('sendLocation' , {
         latitude : position.coords.latitude,
         longitude: position.coords.longitude
      }, ()=>{
         console.log('location shared')

         $sendLocation.removeAttribute('disabled')
      })
    })
 })


                                                                                      //we are sending data to server now server will add listener for it
 socket.emit('join', {username , room}, (error)=>{                  

      if(error)
      {
         alert(error)
         location.href = '/'
      }
 })                