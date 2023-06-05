import { css, html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Subscription } from '../../../../subscription';
import {
	getSubscriptionStatePlanName,
	getSubscriptionTimeRemaining,
	isSubscriptionStatePaidOrTrial,
	isSubscriptionStateTrial,
	SubscriptionState,
} from '../../../../subscription';
import '../../plus/shared/components/feature-gate-plus-state';
import { pluralize } from '../../../../system/string';
import { focusOutline } from './styles/lit/a11y.css';
import { elementBase } from './styles/lit/base.css';
import './overlays/pop-over';

@customElement('gk-feature-gate-badge')
export class FeatureGateBadge extends LitElement {
	static override styles = [
		elementBase,
		css`
			:host {
				position: relative;
			}

			:host(:focus) {
				${focusOutline}
			}

			.badge-container {
				position: relative;
			}

			.badge {
				cursor: help;
			}

			.badge.inactive {
				filter: grayscale(100%);
			}

			.badge-popover {
				width: max-content;
				right: 0;
				top: 100%;
				overflow: hidden;
				text-align: left;
			}

			.badge-footnote {
				white-space: break-spaces;
			}

			.badge-trial-left {
				font-weight: 400;
				opacity: 0.6;
				margin-left: 1rem;
			}

			.badge:not(:hover) ~ .badge-popover {
				display: none;
			}
		`,
	];

	@property()
	placement?: `${'top' | 'bottom'} ${'start' | 'end'}` = 'top end';

	@property({ attribute: false })
	subscription?: Subscription;

	override render() {
		const paidOrTrial = isSubscriptionStatePaidOrTrial(this.subscription?.state);

		return html`
			<span class="badge-container">
				<span class="badge ${paidOrTrial ? 'active' : 'inactive'}">✨</span>
				<pop-over placement="${this.placement}" class="badge-popover">
					<span slot="heading"
						>${getSubscriptionStatePlanName(
							this.subscription?.state,
							this.subscription?.plan.effective.id,
						)}${this.trialHtml}</span
					>
					${this.footnoteHtml}
				</pop-over>
			</span>
		`;
	}

	private get trialHtml() {
		if (!isSubscriptionStateTrial(this.subscription?.state)) return nothing;

		const days = getSubscriptionTimeRemaining(this.subscription!, 'days') ?? 0;
		return html`<span class="badge-trial-left">${days < 1 ? '<1 day' : pluralize('day', days)} left</span>`;
	}

	private get footnoteHtml() {
		switch (this.subscription?.state) {
			case SubscriptionState.VerificationRequired:
			case SubscriptionState.Free:
			case SubscriptionState.FreePreviewTrialExpired:
				return html`<span class="badge-footnote"
					>✨ Requires a trial or subscription for use on privately hosted repos.</span
				>`;
			case SubscriptionState.FreePlusTrialExpired:
			case SubscriptionState.FreeInPreviewTrial:
			case SubscriptionState.FreePlusInTrial:
				return html`<span class="badge-footnote"
					>✨ Requires a subscription for use on privately hosted repos.</span
				>`;
			default:
				return nothing;
		}
	}
}
