let remainingCharacters = 0
const applicationState = {
  tweets: [],
  currentUser: '',
}

const getApplicationState = () => JSON.parse(localStorage.getItem('pttAppState')) || applicationState

const tweetList = () => getApplicationState().tweets
const getCurrentUser = () => getApplicationState().currentUser

const save = state => localStorage.setItem('pttAppState', JSON.stringify(state))

const saveTweets = (tweets) => {
  const oldState = getApplicationState()
  const newState = {
    ...oldState,
    tweets,
  }
  save(newState)
}

const saveUser = newUserState => save(newUserState)

const renderReTweetItem = ({
  body,
  userName,
  createdAt
}) => `
  <li>${body} by <span style="font-weight: bold">${userName || 'Anonymous'}</span>
    <span style="color: grey; font-style: italic">${moment(createdAt).startOf('hour').fromNow()}</span>
  </li>
`

const renderReTweets = ({
  retweets
}) => retweets.map(renderReTweetItem).join('\n')

const renderDeleteButtonIfMyTweet = (idx, userName) => {
  if (getApplicationState().currentUser === userName) return `<button href="#" onclick="onDelete(${idx})" class="btn btn-danger">Delete</button>`
  return ''
}

const renderTweetItem = (tweet, idx) => {
  const {
    body,
    likes,
    retweets,
    userName,
    createdAt,
  } = tweet
  const formattedDate = moment(createdAt).startOf('hour').fromNow()
  return `
      <li class="list-group-item" style="margin: 10px; border: 4px solid #001F54;">
        <h1 style="color: #001F54">${body}</h1>
        <hr>
        <p>Posted by <span style="font-weight: bold">${userName || 'Anonymous'}</span> <span style="color: grey; font-style: italic">${formattedDate}</span></p>
        <button href="#" onclick="onTweetLike(${idx})" class="btn btn-primary">${likes.length > 0 ? likes.length : ''} Like${likes.length > 1 ? 's' : ''} </button>
        <button href="#" onclick="onReTweet(${idx})" class="btn btn-success">Retweet</button>
        ${renderDeleteButtonIfMyTweet(idx, userName)}
        ${retweets.length > 0 ? `<ul style="margin-top: 2%">${renderReTweets(tweet)}</ul>` : ''}
      </li>
  `
}

const renderTweets = () => {
  document.getElementById('tweetList').innerHTML = tweetList().map(renderTweetItem).join('\n')
}

const resetTweetInput = () => {
  if (remainingCharacters === 0) {
    document.getElementById('userPrompt').style.color = 'black'
  }
  document.getElementById('userTweetInput').focus()
  document.getElementById('userTweetInput').value = ''
  document.getElementById('userPrompt').innerHTML = '140 characters remaining'
}

const onDelete = (selectedTweetIdx) => {
  const tweets = tweetList().filter((_, idx) => idx !== selectedTweetIdx)
  saveTweets(tweets)
  renderTweets()
}

const onAddTweet = () => {
  const body = document.getElementById('userTweetInput').value
  if (body.length < 1) return
  const tweet = {
    body,
    likes: [],
    retweets: [],
    createdAt: new Date,
    userName: getCurrentUser()
  }

  const tweets = tweetList()

  tweets.unshift(tweet)
  saveTweets(tweets)
  renderTweets()
  resetTweetInput()
}

const onReTweet = idx => {
  const tweets = tweetList()
  const body = prompt('Whats on your mind?')

  if (body.length < 1) return

  const retweet = {
    body,
    likes: [],
    createdAt: new Date,
    userName: getCurrentUser(),
  }
  tweets[idx].retweets.push(retweet)

  saveTweets(tweets)
  renderTweets()
}

const onTweetLike = idx => {
  const currentUser = getCurrentUser()
  let tweets = tweetList()
  const tweetBeingLiked = tweets[idx]
  if (tweetBeingLiked.likes.includes(currentUser)) {
    const newLikes = tweetBeingLiked.likes.filter(like => like !== currentUser)
    tweetBeingLiked.likes = newLikes
  } else {
    tweetBeingLiked.likes.push(currentUser)
  }

  saveTweets(tweets)
  renderTweets()
}

const onSignIn = () => {
  const oldState = getApplicationState()
  const newState = {
    ...oldState,
    currentUser: document.getElementById('userNameInput').value
  }
  document.getElementById('currentUserOptions').style.visibility = 'show'
  saveUser(newState)
}

const onSignOut = () => {
  const oldState = getApplicationState()
  const newState = {
    ...oldState,
    currentUser: ''
  }
  document.getElementById('signInForm').style.visibility = ''
  document.getElementById('currentUserOptions').style.visibility = 'hidden'
  saveUser(newState)
}

const checkLocalStorage = () => {
  const isSignedIn = getCurrentUser() !== ''
  if (isSignedIn) {
    document.getElementById('signInForm').style.visibility = 'hidden'
    document.getElementById('currentUserPrompt').innerHTML = getCurrentUser()
  } else {
    document.getElementById('signInForm').style.visibility = 'show'
    document.getElementById('currentUserOptions').style.visibility = 'hidden'
    document.getElementById('currentUserPrompt').innerHTML = getApplicationState().currentUser
  }
}

checkLocalStorage()

const addInputEventListener = () => {
  document.getElementById('userTweetInput').addEventListener('input', function (_) {
    remainingCharacters = 140 - this.value.length
    if (remainingCharacters === 0) document.getElementById('userPrompt').style.color = 'red'
    const userPrompt = `${remainingCharacters} characters remaining`
    document.getElementById('userPrompt').innerHTML = userPrompt
  })
}

renderTweets()
addInputEventListener()
document.getElementById('userTweetInput').focus()