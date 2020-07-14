import React from "react"

const Error = ({ statusCode = null }) => {
  return <p>{`failed ${statusCode}`}</p>
}

export default Error
