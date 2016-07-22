/**
 */
package KoheseModel.impl;

import KoheseModel.Action;
import KoheseModel.Issue;
import KoheseModel.KoheseModelPackage;

import org.eclipse.emf.common.notify.Notification;

import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.InternalEObject;

import org.eclipse.emf.ecore.impl.ENotificationImpl;

/**
 * <!-- begin-user-doc -->
 * An implementation of the model object '<em><b>Issue</b></em>'.
 * <!-- end-user-doc -->
 * <p>
 * The following features are implemented:
 * </p>
 * <ul>
 *   <li>{@link KoheseModel.impl.IssueImpl#getResolution <em>Resolution</em>}</li>
 *   <li>{@link KoheseModel.impl.IssueImpl#getAnalysis <em>Analysis</em>}</li>
 * </ul>
 *
 * @generated
 */
public class IssueImpl extends ObservationImpl implements Issue {
	/**
	 * The cached value of the '{@link #getResolution() <em>Resolution</em>}' reference.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see #getResolution()
	 * @generated
	 * @ordered
	 */
	protected Action resolution;

	/**
	 * The cached value of the '{@link #getAnalysis() <em>Analysis</em>}' reference.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see #getAnalysis()
	 * @generated
	 * @ordered
	 */
	protected Action analysis;

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	protected IssueImpl() {
		super();
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	protected EClass eStaticClass() {
		return KoheseModelPackage.Literals.ISSUE;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public Action getResolution() {
		if (resolution != null && resolution.eIsProxy()) {
			InternalEObject oldResolution = (InternalEObject)resolution;
			resolution = (Action)eResolveProxy(oldResolution);
			if (resolution != oldResolution) {
				if (eNotificationRequired())
					eNotify(new ENotificationImpl(this, Notification.RESOLVE, KoheseModelPackage.ISSUE__RESOLUTION, oldResolution, resolution));
			}
		}
		return resolution;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public Action basicGetResolution() {
		return resolution;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public void setResolution(Action newResolution) {
		Action oldResolution = resolution;
		resolution = newResolution;
		if (eNotificationRequired())
			eNotify(new ENotificationImpl(this, Notification.SET, KoheseModelPackage.ISSUE__RESOLUTION, oldResolution, resolution));
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public Action getAnalysis() {
		if (analysis != null && analysis.eIsProxy()) {
			InternalEObject oldAnalysis = (InternalEObject)analysis;
			analysis = (Action)eResolveProxy(oldAnalysis);
			if (analysis != oldAnalysis) {
				if (eNotificationRequired())
					eNotify(new ENotificationImpl(this, Notification.RESOLVE, KoheseModelPackage.ISSUE__ANALYSIS, oldAnalysis, analysis));
			}
		}
		return analysis;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public Action basicGetAnalysis() {
		return analysis;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public void setAnalysis(Action newAnalysis) {
		Action oldAnalysis = analysis;
		analysis = newAnalysis;
		if (eNotificationRequired())
			eNotify(new ENotificationImpl(this, Notification.SET, KoheseModelPackage.ISSUE__ANALYSIS, oldAnalysis, analysis));
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public Object eGet(int featureID, boolean resolve, boolean coreType) {
		switch (featureID) {
			case KoheseModelPackage.ISSUE__RESOLUTION:
				if (resolve) return getResolution();
				return basicGetResolution();
			case KoheseModelPackage.ISSUE__ANALYSIS:
				if (resolve) return getAnalysis();
				return basicGetAnalysis();
		}
		return super.eGet(featureID, resolve, coreType);
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public void eSet(int featureID, Object newValue) {
		switch (featureID) {
			case KoheseModelPackage.ISSUE__RESOLUTION:
				setResolution((Action)newValue);
				return;
			case KoheseModelPackage.ISSUE__ANALYSIS:
				setAnalysis((Action)newValue);
				return;
		}
		super.eSet(featureID, newValue);
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public void eUnset(int featureID) {
		switch (featureID) {
			case KoheseModelPackage.ISSUE__RESOLUTION:
				setResolution((Action)null);
				return;
			case KoheseModelPackage.ISSUE__ANALYSIS:
				setAnalysis((Action)null);
				return;
		}
		super.eUnset(featureID);
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public boolean eIsSet(int featureID) {
		switch (featureID) {
			case KoheseModelPackage.ISSUE__RESOLUTION:
				return resolution != null;
			case KoheseModelPackage.ISSUE__ANALYSIS:
				return analysis != null;
		}
		return super.eIsSet(featureID);
	}

} //IssueImpl
