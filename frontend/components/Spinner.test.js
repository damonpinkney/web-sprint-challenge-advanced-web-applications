import React from "react"
import { render } from "@testing-library/react"
import "@testing-library/jest-dom"

import Spinner from "./Spinner"

test('Make sure the Spinner renders only when it is supposed to', () => {
    const { rerender } = render(<Spinner on={true} />)
    const spinner = document.querySelector('#spinner')
    expect(spinner).toBeInTheDocument()
    rerender(<Spinner on={false} />)
    expect(spinner).not.toBeInTheDocument()
})