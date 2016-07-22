/**
 */
package KoheseModel.impl;

import KoheseModel.Journal;
import KoheseModel.KoheseModelPackage;
import KoheseModel.Observation;

import java.util.Collection;

import org.eclipse.emf.common.util.EList;

import org.eclipse.emf.ecore.EClass;

import org.eclipse.emf.ecore.impl.MinimalEObjectImpl;

import org.eclipse.emf.ecore.util.EObjectResolvingEList;

/**
 * <!-- begin-user-doc -->
 * An implementation of the model object '<em><b>Journal</b></em>'.
 * <!-- end-user-doc -->
 * <p>
 * The following features are implemented:
 * </p>
 * <ul>
 *   <li>{@link KoheseModel.impl.JournalImpl#getObservation <em>Observation</em>}</li>
 * </ul>
 *
 * @generated
 */
public class JournalImpl extends MinimalEObjectImpl.Container implements Journal {
	/**
	 * The cached value of the '{@link #getObservation() <em>Observation</em>}' reference list.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @see #getObservation()
	 * @generated
	 * @ordered
	 */
	protected EList<Observation> observation;

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	protected JournalImpl() {
		super();
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	protected EClass eStaticClass() {
		return KoheseModelPackage.Literals.JOURNAL;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public EList<Observation> getObservation() {
		if (observation == null) {
			observation = new EObjectResolvingEList<Observation>(Observation.class, this, KoheseModelPackage.JOURNAL__OBSERVATION);
		}
		return observation;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@Override
	public Object eGet(int featureID, boolean resolve, boolean coreType) {
		switch (featureID) {
			case KoheseModelPackage.JOURNAL__OBSERVATION:
				return getObservation();
		}
		return super.eGet(featureID, resolve, coreType);
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	@SuppressWarnings("unchecked")
	@Override
	public void eSet(int featureID, Object newValue) {
		switch (featureID) {
			case KoheseModelPackage.JOURNAL__OBSERVATION:
				getObservation().clear();
				getObservation().addAll((Collection<? extends Observation>)newValue);
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
			case KoheseModelPackage.JOURNAL__OBSERVATION:
				getObservation().clear();
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
			case KoheseModelPackage.JOURNAL__OBSERVATION:
				return observation != null && !observation.isEmpty();
		}
		return super.eIsSet(featureID);
	}

} //JournalImpl
