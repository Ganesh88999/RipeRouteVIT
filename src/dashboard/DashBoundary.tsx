import { Component, type ErrorInfo, type ReactNode } from "react"

type Props = { children: ReactNode; label: string }
type State = { message: string | null }

export class DashBoundary extends Component<Props, State> {
  state: State = { message: null }

  static getDerivedStateFromError(error: Error): State {
    return { message: error.message || "Dashboard section failed" }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[RipeRoute] dashboard section failed", this.props.label, error, info.componentStack)
  }

  render() {
    if (this.state.message) {
      return (
        <div className="border border-urgent/40 bg-card px-4 py-3 text-sm text-urgent">
          {this.props.label}: {this.state.message}
        </div>
      )
    }
    return this.props.children
  }
}
